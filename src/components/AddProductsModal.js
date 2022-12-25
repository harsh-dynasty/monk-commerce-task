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
} from "@mui/material";

import React, { useEffect, useState } from "react";
import { StyledButton } from "./Product";
import { StyledButton as StyledOutlinedButton } from "./AddProducts";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  p: 4,
};

const AddProductsModal = ({ open, handleClose, setProducts }) => {
  const [input, setInput] = useState("");

  const [productList, setProductList] = useState([]);
  const [selectedProductList, setSelectedProductList] = useState({});
  useEffect(() => {
    fetch(
      "https://stageapibc.monkcommerce.app/admin/shop/product?search=Fo&page=1"
    )
      .then((res) => res.json())
      .then((data) => {
        setProductList(
          data.map((product) => ({
            id: product.id,
            title: product.title,
            image: product.image.src,

            variants: product.variants.map((vari) => ({
              id: vari.id,
              title: vari.title,
              quantity: vari.inventory_quantity,
              price: vari.price,
            })),
          }))
        );
      });
  }, []);

  useEffect(() => {
    console.log(selectedProductList);
  }, [selectedProductList]);

  const handleAdd = () => {
    if (Object.keys(selectedProductList).length == 0) {
      handleClose(true);
      return;
    }
    const newProductList = productList
      .filter((productObj) =>
        Object.keys(selectedProductList).includes(String(productObj.id))
      )
      .map((productObj) => {
        return {
          ...productObj,
          variants: productObj.variants.filter((variantObj) =>
            selectedProductList[productObj.id].includes(variantObj.id)
          ),
          discount: { type: "Flat Discount", value: 0 },
        };
      });

    setProducts((prev) => {
      const newProducts = Array.from(prev);
      newProducts.splice(open - 1, 1, ...newProductList);

      return newProducts;
    });
    console.log(open);
    handleClose(true);
  };

  const handleToggle = (productId) => {
    if (selectedProductList[productId]) {
      setSelectedProductList((prev) => {
        const newObj = {};
        Object.keys({ ...prev })
          .filter((key) => {
            return key != productId;
          })
          .forEach((key) => {
            newObj[key] = prev[key];
          });
        return newObj;
      });
    } else {
      setSelectedProductList((prev) => ({
        ...prev,
        [productId]: productList.reduce((selected_variant_ids, productObj) => {
          if (productObj.id == productId) {
            selected_variant_ids = productObj.variants.map(({ id }) => id);
          }
          return selected_variant_ids;
        }, []),
      }));
    }
  };
  const handleToggleVariant = (productId, variantId) => {
    setSelectedProductList((prev) => {
      const newObj = { ...prev };

      if (!newObj[productId]) {
        var variants = [];
        variants.push(variantId);
        newObj[productId] = variants;
      } else
        Object.keys(newObj).forEach((key) => {
          if (key == productId) {
            const newArr = [...prev[productId]];
            const currentIndex = newArr.indexOf(variantId);
            if (currentIndex === -1) {
              newArr.push(variantId);
            } else {
              newArr.splice(currentIndex, 1);
            }
            newObj[key] = newArr;
          }
        });

      return newObj;
    });
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

        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            maxHeight: "60vh",
            overflow: "scroll",
          }}
        >
          {productList
            .filter((product) => {
              if (input == "") return true;
              return product.title.toLowerCase().includes(input.toLowerCase());
            })
            .map((product, index) => {
              return (
                <div key={index}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleToggle(product.id)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={
                            selectedProductList[product.id] ? true : false
                          }
                          tabIndex={-1}
                          disableRipple
                          indeterminate={
                            selectedProductList[product.id] &&
                            selectedProductList[product.id]?.length !=
                              product.variants.length
                              ? true
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
                          handleToggleVariant(product.id, variantId)
                        }
                        checked={
                          selectedProductList[product.id] &&
                          selectedProductList[product.id].indexOf(
                            variant.id
                          ) !== -1
                            ? true
                            : false
                        }
                        variant={variant}
                      />
                    );
                  })}
                </div>
              );
            })}
        </List>
        <Divider style={{ marginTop: 10, marginBottom: 10 }} />
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography>
            {Object.keys(selectedProductList).length} products selected
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
