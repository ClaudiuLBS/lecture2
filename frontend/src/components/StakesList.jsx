import { List, ListSubheader } from "@mui/material";
import React from "react";
import StakesListItem from "./StakesListItem";

const StakesList = ({ list, onClick }) => {
  if (list.length === 0)
    return <p className="no-placements">No current placements</p>;

  return (
    <div className="stakes-list">
      <List
        sx={{
          width: "100%",
          bgcolor: "#ffffff",
          position: "relative",
          overflow: "auto",
          maxHeight: 300,
          marginBottom: ".6em",
        }}
        subheader={
          <ListSubheader className="ListSubheader">
            Current placements
          </ListSubheader>
        }
      >
        {list.map((item, index) => (
          <StakesListItem
            onClick={onClick}
            key={index}
            text={item}
            index={index}
          />
        ))}
      </List>
    </div>
  );
};

export default StakesList;
