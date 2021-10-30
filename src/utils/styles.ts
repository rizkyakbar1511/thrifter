import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  navbar: {
    backgroundColor: "#203040",
    "& a": {
      color: "#fff",
      marginLeft: 10,
    },
  },
  main: {
    minHeight: "80vh",
    paddingTop: "3rem",
  },
});

export default useStyles;
