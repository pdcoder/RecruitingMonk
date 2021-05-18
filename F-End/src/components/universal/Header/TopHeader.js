import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import logo from '../../../img/logo.png'
import '../universal.css'
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import Sign from '../../Authentication/GetIn/Sign';
import Signup from '../../Authentication/GetIn/Signup';
import SideBar from './DeskSideBar/SideBar';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

export default function TopHeader() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    left: false,
  });

  const history = useHistory();

  const toggleDrawer = (anchor, open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem button>
          <ListItemIcon> <LiveHelpIcon style={{ color: '#b32800' }} /> </ListItemIcon>
          <ListItemText primary='Questions' style={{ color: '#b32800' }} />
        </ListItem>
        <ListItem button>
          <ListItemIcon> <MailIcon style={{ color: '#b32800' }} /> </ListItemIcon>
          <ListItemText primary='FellowMonk - Bot' style={{ color: '#b32800' }} />
        </ListItem>
        <ListItem button onClick={() => history.push('/library')}>
          <ListItemIcon> <LibraryBooksIcon style={{ color: '#b32800' }} /> </ListItemIcon>
          <ListItemText primary='Library' style={{ color: '#b32800' }} />
        </ListItem>

      </List>
      <Divider />
    </div>
  );

  const sideBar = () => {
    return (
      ['left'].map((anchor) => (
        <React.Fragment key={anchor}>
          <Button id="hamburger" onClick={toggleDrawer(anchor, true)}>
            <MenuIcon style={{ color: '#b32800', position: 'absolute', left: '19px' }} fontSize="medium" />
          </Button>
          <SwipeableDrawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
            onOpen={toggleDrawer(anchor, true)}
          >
            {list(anchor)}
          </SwipeableDrawer>
        </React.Fragment>
      ))
    )
  }

  const logoImg = () => {
    if (localStorage.token) {
      return (
        <div style={{ marginLeft: '-70px' }} className="logo" onClick={() => history.push('/')}>
          <img src={logo} alt="Logo"></img>
        </div>
      )
    }
    else {
      return (
        <div className="logo" onClick={() => history.push('/')}>
          <img src={logo} alt="Logo"></img>
        </div>
      )
    }
  }

  const signin = () => {
    return (
      <Sign />
    )
  }

  const signup = () => {
    return (
      <Signup />
    )
  }

  const [homeStyle, setHomeStyle] = useState('#B32800')
  const [comStyle, setComStyle] = useState('')

  const btnHome = () => {
    history.push('/');
    setHomeStyle('#B32800')
    setComStyle('#000000')
  }

  const btnCom = () => {
    history.push('/community');
    setComStyle('#B32800')
    setHomeStyle('#000000')
  }

  return (
    <div className="TopHead">

      <div className="TopHeader" id="mobTopHeader">
        <div>
          {sideBar()}
        </div>
        <div>
          {logoImg()}
        </div>
        <div>
          {signin()}
        </div>
      </div>


      <div id="deskTopHeader">
        <div id="subTopHead">
          <SideBar />

          {logoImg()}
          <div className="subTopHead2">
            <Button className="btnHome" style={{ color: `${homeStyle}` }} onClick={btnHome}><span>Home</span></Button>
            <Button className="btnCom" onClick={btnCom} style={{ color: `${comStyle}`, marginLeft: '10px' }}><span>Community</span></Button>
          </div>
        </div>

        <div className="sign" style={{ display: 'inline-flex', position: 'absolute', right: '3%' }}>
          <div>
            {signin()}
          </div>

          <div>
            {signup()}
          </div>
        </div>

      </div>
    </div>

  );
}