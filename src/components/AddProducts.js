import styled from "@emotion/styled";
import { Button, Card, Typography } from "@mui/material";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import AddProductsModal from "./AddProductsModal";
import Product from "./Product";

export const StyledButton = styled(Button)({
  borderColor: "#008060",
  color: "#008060",

  "&:hover": {
    backgroundColor: "#008060",
    color: "white",
  },
});
const AddProducts = () => {
  const [openModal, setOpenModal] = useState(0);
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 100,
      discount: { type: "%Off", value: 0 },
      title: "Fog Linen Chambray Towel - Beige Stripe",
      variants: [
        {
          id: 1,
          title: "XS / Silver",
        },
        {
          id: 2,
          title: "S / Silver",
        },
        {
          id: 3,
          title: "M / Silver",
        },
      ],
    },
    {
      id: 101,
      discount: { type: "Flat Discount", value: 0 },
      title: "Orbit Terrarium - Large",
      variants: [
        {
          id: 2,
          title: "S / Silver",
        },
      ],
    },
  ]);

  const handleClose = () => {
    setOpenModal(0);
  };
  const addProducts = () => {
    setProducts((prev) => {
      return [...prev, { discount: { type: "%Off", value: 0 }, variants: [] }];
    });
  };
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setProducts(items);
  };
  return (
    <>
      <Card
        style={{
          padding: 10,
          margin: 10,
        }}
      >
        <Typography variant="h4">Add Products</Typography>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="products">
            {(provided) => (
              <div
                className="products"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {products.map((product, index) => (
                  <Draggable
                    key={String(index)}
                    draggableId={String(index)}
                    index={index}
                    isDragDisabled={isDragDisabled}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Product
                          product={product}
                          showRemoveProductButton={products.length > 1}
                          // key={index}
                          index={index}
                          setOpenModal={setOpenModal}
                          setProducts={setProducts}
                          setIsDragDisabled={setIsDragDisabled}
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

        <StyledButton size="large" variant="outlined" onClick={addProducts}>
          Add Product
        </StyledButton>
      </Card>
      <AddProductsModal
        open={openModal}
        handleClose={handleClose}
        setProducts={setProducts}
        products={products}
      />
    </>
  );
};

export default AddProducts;
