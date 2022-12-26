import { Close, Search } from "@mui/icons-material";
import {
  Modal,
  Typography,
  Paper,
  IconButton,
  Divider,
  InputBase,
  ListItemIcon,
  Checkbox,
  ListItem,
  List,
  ListItemButton,
  Avatar,
  CircularProgress,
} from "@mui/material";

import React, { useCallback, useEffect, useState } from "react";
import { StyledButton } from "./Product";
import { StyledButton as StyledOutlinedButton } from "./AddProducts";

let timeout = null;

const AddProductsModal = ({ open, handleClose, products, setProducts }) => {
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(true);

  const [productList, setProductList] = useState([]); //fetched product list from api
  const [selectedProductList, setSelectedProductList] = useState([]); //mainting checkbox states here

  const check_prod_in_sel_prod_list = useCallback(
    (productId) => {
      for (var i = 0; i < selectedProductList.length; i++) {
        if (selectedProductList[i].id && selectedProductList[i].id == productId)
          return i;
      }
      return -1;
    },
    [selectedProductList]
  );

  const check_var_in_sel_prod_list = useCallback(
    (productId, variantId) => {
      var productIndex = -1;
      var variantIndex = -1;
      for (var i = 0; i < selectedProductList.length; i++) {
        if (
          selectedProductList[i].id &&
          selectedProductList[i].id == productId
        ) {
          productIndex = i;
          const variants = selectedProductList[i].variants;
          for (var j = 0; j < variants.length; j++) {
            if (variants[j].id == variantId) variantIndex = j;
          }
        }
      }
      return [productIndex, variantIndex];
    },
    [selectedProductList]
  );

  function listener() {
    const myDiv = document.getElementById("product_list");
    if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
      setPage((prev) => prev + 1);
    }
  }
  useEffect(() => {
    if (open) {
      setSelectedProductList(products.filter((product) => product.id));
    }
  }, [open]);

  useEffect(() => {
    setIsLoadingList(true);
    clearTimeout(timeout);
    setPage(1);
    timeout = setTimeout(() => {
      fetchProducts();
    }, 500);
  }, [input]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    setTimeout(() => {
      if (!isLoadingList)
        document
          .getElementById("product_list")
          ?.addEventListener("scroll", listener);
      else
        document
          .getElementById("product_list")
          ?.removeEventListener("scroll", listener);
    }, 1000);
  }, [isLoadingList]);

  const fetchProducts = () => {
    fetch(
      `https://stageapibc.monkcommerce.app/admin/shop/product?${
        input === "" ? "" : `search=${input}&`
      }page=${page}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data)
          setProductList((prev) => {
            const fetched_list = data.map((product) => ({
              id: product.id,
              title: product.title,
              image: product.image.src,

              variants: product.variants.map((vari) => ({
                id: vari.id,
                title: vari.title,
                quantity: vari.inventory_quantity,
                price: vari.price,
              })),
            }));
            if (page == 1) return fetched_list;
            else return [...prev, ...fetched_list];
          });
        setIsLoadingList(false);
      });
  };

  const check_sproduct_in_list = useCallback(
    (productId, list) => {
      return list.reduce((ans, prod) => {
        if (prod.id == productId) return ans || true;
        else return ans || false;
      }, false);
    },
    [selectedProductList, products]
  );

  const handleAdd = () => {
    setProducts((prevList) => {
      var newList = Array.from(prevList);
      selectedProductList.forEach((product) => {
        if (!check_sproduct_in_list(product.id, products)) {
          if (newList[open - 1].id) newList.splice(open - 1, 0, product);
          else newList.splice(open - 1, 1, product);
        }
      });
      newList = newList.filter((prod) => {
        if (!prod.id) return true;
        else return check_sproduct_in_list(prod.id, selectedProductList);
      });
      return newList;
    });
    handleClose(false);
  };

  const handleToggle = (product) => {
    const index = check_prod_in_sel_prod_list(product.id);
    if (index == -1) {
      setSelectedProductList((prev) => [...prev, product]);
    } else {
      const selected_product_list = Array.from(selectedProductList);
      selected_product_list.splice(index, 1);
      setSelectedProductList(selected_product_list);
    }
  };
  const handleToggleVariant = (product, variant) => {
    const [productIndex, variantIndex] = check_var_in_sel_prod_list(
      product.id,
      variant.id
    );

    if (productIndex == -1) {
      //make new product
      // add variant in new product
      //add product in new list
      setSelectedProductList((prevList) => {
        var newList = Array.from(prevList);
        var newProduct = { ...product, variants: [variant] };
        newList.push(newProduct);
        return newList;
      });
    } else if (variantIndex == -1) {
      //go to the product
      //push variants to its existing variants
      //add product in new list

      setSelectedProductList((prevList) => {
        var newList = Array.from(prevList).map((prod) => {
          if (prod.id == product.id) {
            var newVariants = Array.from(prod.variants);
            newVariants.push(variant);
            return { ...prod, variants: newVariants };
          } else return { ...prod };
        });
        return newList;
      });
    } else {
      //go to the product
      //remove variant from the existing variants
      //return modified list
      setSelectedProductList((prevList) => {
        var newList = Array.from(prevList);
        newList = newList.map((prod) => {
          var newProd = { ...prod };
          if (newProd.id == product.id) {
            var newVariants = Array.from(newProd.variants);
            newVariants.splice(variantIndex, 1);
            newProd.variants = newVariants;
          }
          return newProd;
        });
        return newList;
      });
    }
  };
  return (
    <Modal
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      open={open == "0" ? false : true}
      onClose={handleClose}
    >
      <Paper
        elevation={6}
        style={{ padding: 10, position: "relative", width: "60%" }}
      >
        <Typography variant="h6" component="h2">
          Select Products
        </Typography>
        <IconButton
          style={{ position: "absolute", top: 10, right: 10 }}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />

        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "90%",
          }}
        >
          <IconButton sx={{ p: "10px" }} aria-label="menu">
            <Search />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search product"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Paper>
        {isLoadingList ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              margin: 10,
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          <List
            id="product_list"
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              maxHeight: "60vh",
              overflow: "scroll",
            }}
          >
            {productList.length > 0 &&
              productList.map((product, index) => {
                return (
                  <div key={index}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleToggle(product)}
                        dense
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedProductList.reduce((ans, prod) => {
                              if (product.id == prod.id) return ans || true;
                              return ans || false;
                            }, false)}
                            tabIndex={-1}
                            disableRipple
                            indeterminate={
                              //if checkbox checked then----
                              //prodlist variants length == selectedlist variants ? false :true
                              //otherwise false
                              selectedProductList.reduce((ans, prod) => {
                                if (product.id == prod.id) return ans || true;
                                return ans || false;
                              }, false)
                                ? productList.reduce((total, prod) => {
                                    if (prod.id == product.id) {
                                      return total + prod.variants.length;
                                    } else return total;
                                  }, 0) ==
                                  selectedProductList.reduce((total, prod) => {
                                    if (prod.id == product.id) {
                                      return total + prod.variants.length;
                                    } else return total;
                                  }, 0)
                                  ? false
                                  : true
                                : false
                            }
                          />
                        </ListItemIcon>
                        <Avatar
                          alt=""
                          style={{ marginRight: 10 }}
                          src={product.image}
                        />
                        <Typography>{product.title}</Typography>
                      </ListItemButton>
                    </ListItem>
                    {product.variants.map((variant) => {
                      return (
                        <Variant
                          key={variant.id}
                          handleToggle={(variantId) =>
                            handleToggleVariant(product, variant)
                          }
                          checked={selectedProductList.reduce((ans, prod) => {
                            if (product.id == prod.id) {
                              return (
                                ans ||
                                prod.variants.reduce((ans, vari) => {
                                  if (vari.id == variant.id) return ans || true;
                                  return ans || false;
                                }, false)
                              );
                            }
                            return ans || false;
                          }, false)}
                          variant={variant}
                        />
                      );
                    })}
                  </div>
                );
              })}
          </List>
        )}
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography>
            {selectedProductList.length} products selected
          </Typography>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <StyledOutlinedButton variant="outlined" onClick={handleClose}>
              Cancel
            </StyledOutlinedButton>
            <StyledButton onClick={handleAdd}>Add</StyledButton>
          </div>
        </div>
      </Paper>
    </Modal>
  );
};

const Variant = ({ handleToggle, variant, checked }) => {
  return (
    <ListItem disablePadding style={{ paddingLeft: "50px" }}>
      <ListItemButton onClick={() => handleToggle(variant.id)} dense>
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checked}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>

        <Typography>{variant.title}</Typography>
        <div style={{ marginLeft: "auto", display: "flex", gap: 50 }}>
          {" "}
          <Typography>{variant.quantity} available</Typography>
          <Typography>${variant.price} </Typography>
        </div>
      </ListItemButton>
    </ListItem>
  );
};
export default AddProductsModal;
