import React, {Component} from 'react';
import {Table, Input, Button, Modal, Select} from 'antd';
import {showMessage} from '../Untils/untils'
import { Config } from '../../config'

// import './Group.css'

export default class Statistics extends Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'ID',
                dataIndex: '_id',
                width: '30%'
            },
            {
                title: '小组名',
                dataIndex: 'name'
            },
            {
                title: 'leader',
                dataIndex: 'leader'
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) =>
                    (
                        <span>
                            {/*<span className={'edit'}
                                  onClick={this.typeEdit.bind(this, record.name, record._id, record.leader)}>编辑</span>*/}
                            <span className={'det'}
                                  onClick={this.groupDet.bind(this, record.name, record._id)}>查看</span>
                            <span className={'delete'} onClick={this.typeDel.bind(this, record.name, record.leader)}>删除</span>
                        </span>
                    ),
            },
        ];

        this.state = {
            dataSource: [],
            count: 0,
            visible: false,
            name: '',
            type: 'add',
            confirmModal: false,
            leader: '',
            OPTIONS: []
        };

    }

    // 编辑小组
    typeEdit = (name, id, leader) => {
        this.setState({
            visible: true,
            name: name,
            type: 'edit',
            leader: leader,
            _id: id
        });
        this.getNoGroupUser()
    };
    // 查看组员
    groupDet = (id) => {
        this.props.history.push('/groupDet/' + id)
    };
    // 删除小组
    typeDel = (name, leader) => {
        this.setState({
            confirmModal: true,
            name: name,
            leader: leader,
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
            showMessage('小组名不能为空', 'error');
            return
        }
        if (this.state.leader.trim() === '') {
            showMessage('组长不能为空', 'error');
            return
        }
        this.setGroupData();
    };
    // 动态改变input值
    onChange = e => {
        this.setState({
            name: e.target.value,
        });
    };

    // 初始化请求数据
    componentWillMount() {
        this.getCategoryData();
    }

    // 添加小组
    handleAdd = () => {
        this.setState({
            visible: true,
            type: 'add',
            name: '',
            leader: ''
        });
        this.getNoGroupUser()
    };
    // 确定删除小组
    confirmModalOk = () => {
        this.setGroupData();
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
    // 获取分类数据
    getCategoryData = () => {
        fetch(Config.host + '/group')
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    res.data.forEach((item, index) => {
                        item.key = item._id;
                    });
                    this.setState({
                        dataSource: res.data,
                        count: res.data.length
                    });
                }
            })
    };

    // 操作分组数据
    setGroupData = () => {
        fetch(Config.host + '/group', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'type=' + this.state.type + '&name=' + this.state.name + '&leader=' + this.state.leader + '&_id=' + this.state._id
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.getCategoryData();
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

    // 获取没有分组的用户
    getNoGroupUser = () => {
        fetch(Config.host + '/userNoGroup', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.setState({
                        OPTIONS: res.data
                    })
                } else {
                    showMessage(res.msg, 'error')
                }
            })
    };

    // 监听下拉选择变化
    selectChange = e => {
        this.setState({
            leader: e
        })
    };

    render() {
        const {dataSource, leader} = this.state;
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
                    新增小组
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                />
                <Modal
                    title="新增小组"
                    centered
                    visible={this.state.visible}
                    onOk={() => this.setModalVisibleOk(false)}
                    onCancel={() => this.setModalVisible(false)}
                >
                    <div className="name row">
                        <span>小组名:</span>
                        <div className={'cont'}><Input placeholder="请输入小组名称" allowClear value={this.state.name}
                                                       onChange={this.onChange}/>
                        </div>
                    </div>
                    <div className="leader row">
                        <span className={'leader'}>Leader</span>
                        <div className={'cont'}><Select
                            placeholder="请选择"
                            value={leader}
                            onChange={this.selectChange}
                            style={{width: '100%'}}
                        >
                            {this.state.OPTIONS.map(item => (
                                <Select.Option key={item.name} value={item.name}>
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

