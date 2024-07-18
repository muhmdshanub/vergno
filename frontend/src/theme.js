// theme.js
import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffff',
    },
    secondary: {
      main: '#000000',
    },
    danger:{
      main:'#bb321f'
    },
    otherColor: {
      main: '#239418',
    },
    logoColor:{
        main: '#1976d2',
    },
    submitButton:{
      main:"#3ea6fa",
    },
    submitButtonEnhanced:{
      main:'#008DFF '
    },
    secondaryButton:{
      main:'#0787B0',
    },
    secondaryButtonEnhanced:{
      main:"#067CA1",
    },
    ternaryButton:{
      main:"#B0CFFF",
    },
    ternaryButtonEnhanced : {
        main:"#76A6F0"
    },
    textFieldbg:{
      main: "#F2FAFF"
    },
    textFieldbgEnhanced:{
      main:"#C5E3F5",
    },
    // backgroundColor: {
    //   // default: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Light mode gradient
    //   main: 'linear-gradient(to left, #96DFFF 9%, #B4E8FF 30%, #C9EEFF 57%, #DBF4FF 76%, #DBF4FF 85%, #DBF4FF 94%)',
    // },
    // backgroundColor: {
    //   // default: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Light mode gradient
    //   main: 'linear-gradient(to left, #96DFFF 9%, #B4E8FF 30%, #C9EEFF 57%, #DBF4FF 76%, #DBF4FF 85%, #DBF4FF 94%)',
    // },
    rainbow:{
      main:"#7300ff",
      default:"#7300ff"
      // main: 'linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet, red);',
      // default:'linear-gradient(to right,#FF0000 0%, #FF9900 12%,#FFF500 25%,#00FF00 38%,#00FFB2 51%, #00A3FF 67%,#001AFF 78%,#9E00A8 89%,#F000FF 97% );'
    },
    backgroundColor:{
      main:"#cae8ff",
      default:"#A7E5FF",
    },
    iconbg:{
      main:"#DDF0FF"
    },
    iconbgEnhanced:{
      main:"#ABDAFF",
    },
    buttonOutline:{
      main:"#0085FF"
    },
    featuresSelect:{
      main:"#ddf0ff"
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0000',
    },
    secondary: {
      main: '#ffff',
    },
    danger:{
      main:'#ff0011',
      default:'#ff0011'
    },
    otherColor: {
      main: '#C31970',
    },
  },
});
