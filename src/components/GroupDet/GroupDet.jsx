import React, {Component} from 'react';
import { Table, Button, Modal, Select } from 'antd';
import { showMessage } from '../Untils/untils'
import { Config } from '../../config'

export default  class GroupDet extends Component {

    constructor(props) {
        super(props);
        const user = JSON.parse(localStorage.getItem('USER'));
        this.columns = [
            {
                title: 'ID',
                dataIndex: '_id',
                width: '30%'
            },
            {
                title: '姓名',
                dataIndex: 'name'
            },
            {
                title: '小组名',
                dataIndex: 'group'
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) =>
                    (
                        <span>
                            {
                                user.auth > 8 && record.isLeader === 0 && (<span className={'edit'} onClick={this.setLeader.bind(this, record.name)}>指定为leader</span>)
                            }
                            {
                                record.isLeader === 0 && ( <span className={'delete'} onClick={this.removeGroup.bind(this, record.name)}>移除小组</span>)
                            }

                        </span>
                    ),
            },
        ];

        this.state = {
            dataSource: [],
            group: this.props.match.params.id,
            count: 0,
            name: '',
            visible: false,
            categoryName: '',
            type: 'add',
            confirmModal: false,
            selectedUserName: '',
            OPTIONS : [],
            member: ''
        };

    }
    // 设置为leader
    setLeader = (name) => {
        this.setState({
            confirmModal: true,
            type: 'set',
            member: name
        })
    };

    // 监听下拉选择变化
    selectChange = e => {
        this.setState({
            member: e
        })
    };

    // 移除小组
    removeGroup = (name) => {
        this.setState({
            confirmModal: true,
            type: 'remove',
            member: name
        })
    };

    // 初始化请求数据
    componentWillMount() {
        this.setState({
           group: this.props.match.params.id
        });
        this.getGroupData()
    }
    // 添加小组成员
    handleAdd = () => {
        this.setState({
            visible: true,
            type: 'add',
            member: ''
        });
        this.getNoGroupUser()
    };
    // 保存新增小组成员
    setModalVisibleOk = () => {
        if (this.state.member === '') {
            showMessage('请选择成员', 'error');
            return
        }
        this.setMemberData();
    };
    // 取消
    setModalVisible = () => {
        this.setState({
            visible: false,
        });
    };
    // 确定删除分类
    confirmModalOk = () => {
        this.setMemberData();
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
        this.setState({ dataSource: newData });
    };
    // 获取数据
    getGroupData = () => {
        fetch(Config.host + '/getGroupDet?group=' + this.state.group)
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

    // 操作分类数据
    setMemberData = () => {
        fetch(Config.host + '/memberGroup', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'type=' + this.state.type + '&name='+this.state.member + '&group=' + this.state.group
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.getGroupData();
                    showMessage(res.msg, 'success');
                    switch (this.state.type) {
                        case 'add':
                            this.setState({
                                visible: false
                            });
                            break;
                        case 'set':
                            this.setState({
                                confirmModal: false
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
        fetch(Config.host + 'userNoGroup', {
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

    render() {
        const { dataSource, type, member } = this.state;
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
                <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                    新增小组成员
                </Button>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={columns}
                />
                <Modal
                    title="新增小组成员"
                    centered
                    visible={this.state.visible}
                    onOk={() => this.setModalVisibleOk(false)}
                    onCancel={() => this.setModalVisible(false)}
                >
                    <div className="leader row">
                        <div className={'cont'}><Select
                            placeholder="请选择"
                            value={member}
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
                    <p>确定要将 <strong>{member}</strong>
                        {
                            type === 'remove' ? ('移除小组？') : ('设置为小组leader？')
                        }
                    </p>
                </Modal>
            </div>
        );
    }
}

