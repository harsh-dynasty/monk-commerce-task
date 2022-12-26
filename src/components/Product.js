import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Button,
  IconButton,
  Link,
  InputBase,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Close,
  DragIndicator,
  Edit,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { styled } from "@mui/material/styles";
export const StyledButton = styled(Button)({
  backgroundColor: "#008060",
  color: "white",

  "&:hover": {
    backgroundColor: "#008080",
    color: "white",
  },
});
const Item = styled(Paper)(({ theme, width, paddingleft, paddingright }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: 40,
  // lineHeight: "60px",
  paddingRight: paddingright ? paddingright : 20,
  paddingLeft: paddingleft ? paddingleft : 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: width ? width : "40%",
}));
const CustomSelect = styled(Select)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: "center",
  height: 40,
  width: "100%",
}));
const Product = ({
  index,
  showRemoveProductButton,
  product,
  setProducts,
  setOpenModal,
  setIsDragDisabled,
}) => {
  const [showVariants, setShowVariants] = useState(false);
  const [discount, setDiscount] = useState(null);

  useEffect(() => {
    setShowVariants(false);
  }, [product]);
  const handleDiscount = (e) => {
    setProducts((prev) => {
      return prev.map((product, i) => {
        if (i == index) {
          return {
            ...product,
            discount: { ...product.discount, [e.target.name]: e.target.value },
          };
        }
        return { ...product };
      });
    });
  };
  const handleOnDragEnd = (productId, result) => {
    setIsDragDisabled(false);
    if (!result.destination) return;

    const items = Array.from(product.variants);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts((prev) => {
      return [...prev].map((prod) => {
        if (prod.id == productId) {
          return { ...prod, variants: items };
        } else return prod;
      });
    });
  };
  const handleRemoveProduct = () => {
    setProducts((prev) => {
      const newList = [...prev].filter((product, i) => index != i);
      return newList;
    });
  };
  const handleRemoveVariant = (variant_id) => {
    setProducts((prev) => {
      var newList = [...prev].map((prod) => {
        if (prod.id == product.id) {
          var newProd = {
            ...prod,
            variants: [...prod.variants].filter(({ id }) => id != variant_id),
          };
          if (newProd.variants.length <= 1) setShowVariants(false);
          return newProd;
        }
        return prod;
      });

      return newList;
    });
  };
  const handleEdit = () => {
    setOpenModal(index + 1);
  };
  return (
    <div
      style={{
        display: "flex",

        flexDirection: "column",
        margin: 20,
        gap: 5,
        width: "40%",
      }}
    >
      <div
        className="product"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

          gap: 20,
        }}
      >
        <IconButton>
          <DragIndicator />
        </IconButton>

        <Typography primary="1" />
        <Item elevation={6}>
          {product.id ? product.title : "Select Product"}
          <IconButton onClick={handleEdit}>
            {" "}
            <Edit />
          </IconButton>
        </Item>
        {!discount ? (
          <StyledButton onClick={() => setDiscount(true)}>
            Add Discount
          </StyledButton>
        ) : (
          <>
            <Item elevation={6} width="40px">
              <InputBase
                value={product.discount.value}
                type="number"
                inputProps={{ min: "0" }}
                name="value"
                onChange={handleDiscount}
              />
            </Item>
            <Item
              elevation={6}
              width="120px"
              paddingleft="0px"
              paddingright="0px"
            >
              <CustomSelect
                value={product.discount.type}
                name="type"
                onChange={handleDiscount}
              >
                <MenuItem value="%Off">% Off</MenuItem>
                <MenuItem value="Flat Discount">Flat Discount</MenuItem>
              </CustomSelect>
            </Item>
          </>
        )}
        {showRemoveProductButton && (
          <IconButton onClick={handleRemoveProduct}>
            {" "}
            <Close />
          </IconButton>
        )}
      </div>
      {product.id && product.variants.length > 1 && (
        <Link
          href="#"
          underline="always"
          onClick={() => setShowVariants((prev) => !prev)}
          style={{ alignSelf: "flex-end", marginRight: 40 }}
        >
          {showVariants ? "Hide Variants" : "Show Variants"}
        </Link>
      )}

      {
        showVariants && product.variants && (
          <DragDropContext
            onDragEnd={(result) => handleOnDragEnd(product.id, result)}
            onDragStart={() => setIsDragDisabled(true)}
          >
            <Droppable droppableId="variants">
              {(provided) => (
                <div
                  className="variants"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {product.variants.map((variant, index) => (
                    <Draggable
                      key={String(variant.id)}
                      draggableId={String(variant.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Variant
                            handleRemoveVariant={handleRemoveVariant}
                            key={variant.id}
                            variant={variant}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )

        // product.variants.map((variant) => (
        //   <Variant
        //     handleRemoveVariant={handleRemoveVariant}
        //     key={variant.id}
        //     variant={variant}
        //   />
        // ))
      }
    </div>
  );
};

const Variant = ({ handleRemoveVariant, variant }) => {
  return (
    <div
      style={{
        display: "flex",
        marginLeft: "10%",
        alignItems: "center",

        gap: 20,
      }}
    >
      {" "}
      <IconButton onClick={(e) => e.stopPropagation()}>
        <DragIndicator />
      </IconButton>
      <Item elevation={6} width="90%">
        {variant.title}
      </Item>
      <IconButton onClick={() => handleRemoveVariant(variant.id)}>
        {" "}
        <Close />
      </IconButton>
    </div>
  );
};

export default Product;
