import React, {PureComponent} from 'react';
import {
    BrowserRouter as Router,
} from 'react-router-dom'
import TopBar from "../TopBar/TopBar";
import LeftNav from "../LeftNav/LeftNav"
import Login from "../Login/Login"
import "./Main.css"


class Main  extends PureComponent{
    constructor(props){
        super(props);
        this.state = {
            isLogin: false
        }
    }
    componentWillMount(){
        // 暂时做简单登录处理 -- 安全性低
        // 处理思路：拿到账号和密码请求后台，通过给登录状态
        let userInfo = localStorage.getItem('USER');
        userInfo?this.setState({isLogin: true}):this.setState({isLogin: false});
    }
    render () {
        return (
            <Router>
                {
                    this.state.isLogin && (
                        <div className={'router'}>
                            <LeftNav/>
                            <TopBar/>
                        </div>)
                }
                {
                    !this.state.isLogin && (
                    <div className={'router'}>
                        <Login />
                    </div>)
                }
            </Router>
        );
    }
}


export default Main