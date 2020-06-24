import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    NavLink,
    Switch,
    Route
} from 'react-router-dom';


import {Layout, Menu, Breadcrumb, Icon, Avatar, Badge } from 'antd';
import Login from '../Login/Login'
import './Index.css'
import Note404 from '../Note404/Note404';
import Projects from '../Projects/Projects';
import Group from "../Group/Group";
import GroupDet from "../GroupDet/GroupDet";
import User from "../User/User";
import Statistics from "../Statistics/Statistics";



const {Header, Content, Footer, Sider} = Layout;
const {SubMenu} = Menu;




export default class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLogin: false,
            openKeys: [],
            userMsg: {
                name: '',
                age: ''
            },
            changeLogin: true,
            collapsed: true,
            auth: 0
        }
    }

    // 登陆
    getLogin = (state) => {
        this.setState({
            isLogin: state
        })
    };

    componentWillMount() {
        // 登录
        let userInfo = localStorage.getItem('USER');
        userInfo ? this.setState({isLogin: true, auth: JSON.parse(userInfo).auth}): this.setState({isLogin: false});
        if (userInfo) {
            this.setState({
                userMsg: {
                    name: JSON.parse(userInfo).name
                }
            })
        }

    }

    loginState = (state) => {
      this.setState({
          changeLogin: state
      })
    };

    rootSubmenuKeys = ['sub1', 'sub4', 'sub5', 'sub8'];

    onOpenChange = openKeys => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({openKeys});
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    };
    onItem1 = () => {
        this.setState({
            openKeys: [],

        })
    };
    onCollapse = ()=> {
        this.setState({
            collapsed: !this.state.collapsed
        })
    };



    render() {
        const { auth } = this.state;
        return (
            <Router>
                {
                    this.state.isLogin && (
                        <div>
                            <Layout style={{minHeight: '100vh'}}>
                                <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                                    <div className="logo">
                                        <NavLink exact to={'/'}>
                                            <img src={require('../../static/img/logo.jpg')} alt="logo"/>
                                        </NavLink>
                                    </div>
                                    <Menu
                                        theme="dark"
                                        defaultSelectedKeys={['1']}
                                        defaultOpenKeys={['sub1']}
                                        mode="inline"
                                        openKeys={this.state.openKeys}
                                        onOpenChange={this.onOpenChange}
                                        collapsed={this.state.collapsed.toString()}
                                    >
                                        <Menu.Item
                                            key="1"
                                            onClick={this.onItem1}
                                        >
                                            <NavLink exact to={'/'}>
                                                <Icon type="home"/>
                                                <span>首页</span>
                                            </NavLink>
                                        </Menu.Item>
                                        <Menu.Item
                                            key="2"
                                            onClick={this.onItem1}
                                        >
                                            <NavLink exact to={'/setting/group'}>
                                                <Icon type="appstore"/>
                                                <span>小组管理</span>
                                            </NavLink>
                                        </Menu.Item>
                                        {
                                            auth > 8 && (<Menu.Item
                                                key="3"
                                                onClick={this.onItem1}
                                            >
                                                <NavLink exact to={'/setting/user'}>
                                                    <Icon type="user"/>
                                                    <span>人员管理</span>
                                                </NavLink>
                                            </Menu.Item>)
                                        }
                                        <Menu.Item
                                            key="4"
                                            onClick={this.onItem1}
                                        >
                                            <NavLink exact to={'/setting/group'}>
                                                <Icon type="file-protect"/>
                                                <span>数据统计</span>
                                            </NavLink>
                                        </Menu.Item>
                                        {/*<SubMenu*/}
                                            {/*key="sub1"*/}
                                            {/*title={*/}
                                                {/*<span>*/}
                                                  {/*<Icon type="appstore"/>*/}
                                                  {/*<span>应用</span>*/}
                                                {/*</span>*/}
                                            {/*}*/}
                                        {/*>*/}
                                            {/*<SubMenu*/}
                                                {/*key="sub2"*/}
                                                {/*title={*/}
                                                    {/*<span>*/}
                                                  {/*<Icon type="file-protect"/>*/}
                                                  {/*<span>设置</span>*/}
                                                {/*</span>*/}
                                                {/*}*/}
                                            {/*>*/}
                                                {/*<Menu.Item key="2">*/}
                                                    {/*<NavLink exact to={'/setting/group'}>*/}
                                                        {/*小组管理*/}
                                                    {/*</NavLink>*/}
                                                {/*</Menu.Item>*/}
                                                {/*{*/}
                                                    {/*auth > 8 && (<Menu.Item key="3">*/}
                                                        {/*<NavLink exact to={'/setting/user'}>*/}
                                                            {/*人员管理*/}
                                                        {/*</NavLink>*/}
                                                    {/*</Menu.Item>)*/}
                                                {/*}*/}
                                            {/*</SubMenu>*/}
                                            {/*<SubMenu*/}
                                                {/*key="sub3"*/}
                                                {/*title={*/}
                                                    {/*<span>*/}
                                                  {/*<Icon type="solution"/>*/}
                                                  {/*<span>社区系统</span>*/}
                                                {/*</span>*/}
                                                {/*}*/}
                                            {/*>*/}
                                                {/*<Menu.Item key="5">帖子列表</Menu.Item>*/}
                                                {/*<Menu.Item key="6">回帖列表</Menu.Item>*/}
                                            {/*</SubMenu>*/}
                                            {/*<Menu.Item key="7">*/}
                                                {/*<NavLink exact to={'/system/news'}>*/}
                                                    {/*消息中心*/}
                                                {/*</NavLink>*/}
                                            {/*</Menu.Item>*/}
                                        {/*</SubMenu>*/}
                                    </Menu>
                                </Sider>
                                <Layout>
                                    <Header style={{background: '#fff', padding: '0 16px', textAlign: 'right'}}>
                                        <Avatar style={{marginRight: '16px'}} size={36} icon="user"/>
                                        <span style={{ marginRight: '16px', fontSize: '14px', fontWeight: '500', verticalAlign: 'middle' }}>{this.state.userMsg.name}</span>
                                      {/*  <Badge count={this.state.userMsg.age} showZero>
                                            <Avatar size={36} icon="message">
                                                <span className="head-example" />
                                            </Avatar>
                                        </Badge>*/}
                                    </Header>
                                    <Content style={{margin: '0 16px'}}>
                                        <Breadcrumb style={{margin: '16px 0'}}>
                                          {/*  <Breadcrumb.Item>User</Breadcrumb.Item>
                                            <Breadcrumb.Item>Bill</Breadcrumb.Item>*/}
                                        </Breadcrumb>
                                        <div style={{padding: 24, background: '#fff', minHeight: 360}}>
                                            <Switch>
                                                <Route exact path={'/'} component={Projects}/>
                                                <Route exact path={'/setting/group'} component={Group}/>
                                                <Route exact path={'/groupDet/:id'} component={GroupDet}/>
                                                <Route exact path={'/setting/user'} component={User}/>
                                                <Route exact path={'/statistics'} component={Statistics}/>
                                                <Route component={Note404}/>
                                            </Switch>
                                        </div>
                                    </Content>
                                    <Footer style={{textAlign: 'center'}}>项目管理系统</Footer>
                                </Layout>
                            </Layout>
                        </div>
                    )
                }
                {
                    !this.state.isLogin && this.state.changeLogin && (
                        <div className={'router'}>
                            <Login changeLogin={this.loginState} getLogin={this.getLogin} />
                        </div>
                    )
                }
                {
                    !this.state.isLogin && !this.state.changeLogin && (
                        <div className={'router'}>

                        </div>
                    )
                }
            </Router>
        );
    }
}