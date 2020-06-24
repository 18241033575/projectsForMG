import React, {Component} from 'react';
import {Table, Input, Button, Modal, Select} from 'antd';
import {showMessage} from '../Untils/untils'
import { Config } from '../../config'

// import './Group.css'
const authName = {
    1: { name: '普通用户' },
    5: { name: '网站管理员' },
    9: { name: '超级管理员' }
};

const authArray = [
    { name: '普通用户', auth: 1 },
    { name: '网站管理员', auth: 5 },
    { name: '超级管理员', auth: 9 }
];


export default class User extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'ID',
                dataIndex: '_id',
                width: '30%'
            },
            {
                title: '账号名',
                dataIndex: 'name'
            },
            {
                title: '密码',
                dataIndex: 'password'
            },
            {
                title: '角色',
                dataIndex: 'auth'
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) =>
                    (
                        <span>
                            <span className={'edit'}
                                  onClick={this.typeEdit.bind(this, record.name, record._id, record.auth, record.password)}>编辑</span>
                            <span className={'delete'} onClick={this.typeDel.bind(this, record.name)}>删除</span>
                        </span>
                    ),
            },
        ];

        this.state = {
            dataSource: [],
            count: 0,
            visible: false,
            name: '',
            password: '',
            type: 'add',
            confirmModal: false,
            role: '',
            OPTIONS: []
        };

    }

    // 编辑
    typeEdit = (name, id, role, password) => {
        this.setState({
            visible: true,
            name: name,
            type: 'edit',
            password: password,
            role: role,
            _id: id,
            title: '编辑用户'
        });
    };
    // 删除
    typeDel = (name) => {
        this.setState({
            confirmModal: true,
            name: name,
            type: 'delete'
        });
    };
    // 取消
    setModalVisible = () => {
        this.setState({
            visible: false,
        });
    };
    // 保存新增小组
    setModalVisibleOk = () => {
        if (this.state.name.trim() === '') {
            showMessage('账号名不能为空', 'error');
            return
        }
        if (this.state.password.trim() === '') {
            showMessage('密码不能为空', 'error');
            return
        }
        if (this.state.role === '') {
            showMessage('请选择分配的角色', 'error');
            return
        }
        this.setUserData();
    };
    // 动态改变input值 -- 账号名
    onChange = e => {
        this.setState({
            name: e.target.value,
        });
    };
    // 动态改变input值 -- 密码
    onChangePassword = e => {
        this.setState({
            password: e.target.value,
        });
    };

    // 初始化请求数据
    componentWillMount() {
        this.getUserData();
    }

    // 添加
    handleAdd = () => {
        this.setState({
            visible: true,
            type: 'add',
            name: '',
            role: '',
            password: '',
            title: '新增用户'
        });
    };
    // 确定删除小组
    confirmModalOk = () => {
        this.setUserData();
    };

    confirmModalCancel = () => {
        this.setState({
            confirmModal: false,
        });
    };

    handleSave = row => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.setState({dataSource: newData});
    };
    // 获取用户数据
    getUserData = () => {
        fetch(Config.host + '/user')
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    res.data.forEach((item, index) => {
                        item.key = item._id;
                        item.auth = authName[item.auth].name
                    });
                    this.setState({
                        dataSource: res.data,
                        count: res.data.length
                    });
                }
            })
    };

    // 操作分组数据
    setUserData = () => {
        fetch(Config.host + '/operateUser', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'type=' + this.state.type + '&name=' + this.state.name + '&role=' + this.state.role + '&_id=' + this.state._id + '&password=' + this.state.password
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.getUserData();
                    showMessage(res.msg, 'success');
                    switch (this.state.type) {
                        case 'add':
                            this.setState({
                                visible: false
                            });
                            break;
                        case 'edit':
                            this.setState({
                                visible: false
                            });
                            break;
                        default:
                            this.setState({
                                confirmModal: false
                            });
                            break;
                    }
                } else {
                    showMessage(res.msg, 'error')
                }
            })
    };
    // 监听下拉选择变化
    selectChange = e => {
        this.setState({
            role: e
        })
    };

    render() {
        const {dataSource, role} = this.state;
        const components = {};
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div>
                <Button onClick={this.handleAdd} type="primary" style={{marginBottom: 16}}>
                    新增用户
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                />
                <Modal
                    title={this.state.title}
                    centered
                    visible={this.state.visible}
                    onOk={() => this.setModalVisibleOk(false)}
                    onCancel={() => this.setModalVisible(false)}
                >
                    <div className="name row">
                        <span>账号名:</span>
                        <div className={'cont'}><Input placeholder="请输入账号名" allowClear value={this.state.name}
                                                       onChange={this.onChange}/>
                        </div>
                    </div>
                    <div className="name row">
                        <span>密 码:</span>
                        <div className={'cont'}><Input placeholder="请输入密码" allowClear value={this.state.password}
                                                       onChange={this.onChangePassword}/>
                        </div>
                    </div>
                    <div className="role row">
                        <span className={'role'}>角色</span>
                        <div className={'cont'}><Select
                            placeholder="请选择"
                            value={role}
                            onChange={this.selectChange}
                            style={{width: '100%'}}
                        >
                            {authArray.map(item => (
                                <Select.Option key={item.name} value={item.auth}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="提示信息"
                    centered
                    visible={this.state.confirmModal}
                    onOk={() => this.confirmModalOk(false)}
                    onCancel={() => this.confirmModalCancel(false)}
                >
                    <p>删除不可恢复，你确定要删除么？</p>
                </Modal>
            </div>
        );
    }
}

