import React, {Component} from 'react';
import {
    NavLink
}from 'react-router-dom'
import './404.css'

class Note404  extends Component {
    render () {
      return(
        <div className={'container404'}>
            <img src={require('../../static/img/404.jpg')} alt="404"/>
            <p>页面找不到了！！！</p>
            <NavLink activeClassName={'back_home'} to="/">返回首页</NavLink>
        </div>
      );
    }
}
export default Note404