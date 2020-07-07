import React, {Component} from 'react';
import { Input, Modal, Select, DatePicker } from 'antd';
import './Projects.css'
import {Config} from '../../config'
import {showMessage} from "../Untils/untils";
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

export default class Projects extends Component {
    constructor(props) {
        super(props);
        let user = JSON.parse(localStorage.getItem('USER'));
        this.columns = [

            {
                title: '任务',
                dataIndex: 'task',
                editable: true,
                width: '10%'
            },
            {
                title: '姓名',
                dataIndex: 'name',
                editable: true,
                width: '8%'
            },
            {
                title: '前置任务',
                dataIndex: 'preTask',
                editable: true,
                width: '10%'
            },
            {
                title: '开始时间',
                dataIndex: 'taskStart',
                editable: true,
                width: '10%'
            },
            {
                title: '结束时间',
                dataIndex: 'taskEnd',
                editable: true,
                width: '10%'
            },
            {
                title: '计划天数',
                dataIndex: 'planDays',
                editable: true,
                width: '6%'
            },
            {
                title: '完成天数',
                dataIndex: 'actualDays',
                editable: true,
                width: '6%'
            },
            {
                title: '状态',
                dataIndex: 'state',
                editable: true,
                width: '5%'
            },
            {
                title: '备注',
                dataIndex: 'remark',
                editable: true,
                width: '15%'
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => (
                    <span>
                        {
                            (user.auth > 8 || user.name === record.name) && !record.parentId && (
                                <span className={'edit'} onClick={this.operateAdd.bind(this, record._id)}>添加子任务</span>)
                        }
                        <span className={'delete'} onClick={this.operateDel.bind(this, record._id)}>删除</span>
                    </span>
                )
            },
        ];

        this.state = {
            dataSource: [],
            count: 0,
            showChart: [],
            dateArray: [],
            mapSign: true,
            confirmModal: false,
            confirmProjectModal: false,
            confirmPersonModal: false,
            confirmTaskModal: false,
            confirmTimeModal: false,
            delId: '',
            dataTotal: [],
            spareData: [], // 备用数据 -- 用于重置任务状态-收起任务
            options: [],
            projectSelected: undefined,
            personSelected: undefined,
            taskSelected: undefined,
            project: {},
            activeItem: {},
            editTaskTime: {}
        };

    }


    componentWillMount() {

        // 获取当前月份每天数组
        let showChart = ['负责人', '任务名称', '开始时间', '结束时间', '依赖', '小时'];
        let daysArray = [];
        const days = this.getDays();
        this.getDateArray();
        for (let i = 1; i < days + 1; i++) {
            daysArray.push((new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (i < 10 ? '0' + i : i))
        }
        showChart = [...showChart, ...daysArray];
        this.setState({
            showChart
        });

        this.getProjects();
    }

    // 获取任务数据
    getProjects = () => {
        let user = JSON.parse(localStorage.getItem('USER'));
        fetch(Config.host + '/projects?group=' + user.group)
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    let tagData = [];
                    tagData = res.data;
                    let midData = JSON.parse(JSON.stringify(tagData));
                    tagData.forEach((item, index) => {
                        item.key = item._id + index;
                        let idx = midData.length - tagData.length;
                        item.children && item.children.forEach((child, childIndex) => {
                            midData.splice(index + childIndex + idx + 1, 0, child);
                            child.key = child._id + childIndex;
                        })
                    });
                    this.setState({
                        dataSource: midData,
                        count: res.data.length,
                        dataTotal: midData,
                        spareData: JSON.parse(JSON.stringify(midData))
                    });
                }
            })
    };

    // 删除任务弹窗
    operateDel = (id) => {
        this.setState({
            confirmModal: true,
            delId: id
        })
    };

    // 取消删除
    confirmModalCancel = () => {
        this.setState({
            confirmModal: false,
            delId: ''
        });
    };

    // 确定删除
    confirmModalOk = () => {
        fetch(Config.host + '/delProjects', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: '_id=' + this.state.delId
        }).then((res) => {
            return res.json()
        }).then(res => {
            if (res.code === 200) {
                this.getProjects();
                this.confirmModalCancel();
                showMessage(res.msg, 'success');
            } else {
                showMessage(res.msg, 'error')
            }
        })
    };

    // 添加子任务
    operateAdd = (id) => {
        let user = JSON.parse(localStorage.getItem('USER'));
        const {count} = this.state;

        const newData = {
            key: count,
            task: '默认主任务',
            taskId: 3,
            name: user.name,
            preTask: '默认前置任务',
            taskStart: this.getNowDay(),
            taskEnd: this.getNowDay(),
            planDays: '1',
            actualDays: '1',
            state: 1,
            parentId: id
        };
        fetch(Config.host + '/add_projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(newData)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    showMessage(res.msg, 'success');
                    this.getProjects()
                } else {
                    showMessage(res.msg, 'error');
                }
            })
    };

    // 获取当前时间
    getNowDay = () => {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1 > 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
        let day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate();
        return year + '-' + month + '-' + day
    };

    // 获取当前月份天数
    getDays = () => {
        let d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        return d.getDate();
    };

    // 获取日期数组
    getDateArray = () => {
        let midArray = [];
        for (let i = 0; i < this.getDays(); i++) {
            midArray.push(i)
        }
        this.setState({
            dateArray: midArray
        })
    };

    handleDelete = key => {
        const dataSource = [...this.state.dataSource];
        this.setState({dataSource: dataSource.filter(item => item.key !== key)});
    };

    editName = (item) => {
        fetch(Config.host + '/groupMember', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(item)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.setState({
                        options: res.data
                    })
                } else {
                    showMessage(res.msg, 'error');
                }
            });
        this.setState({
            activeItem: item,
            confirmPersonModal: true
        })
    };

    handleAdd = () => {
        let user = JSON.parse(localStorage.getItem('USER'));
        const {count} = this.state;

        const newData = {
            key: count,
            task: '默认主任务',
            name: user.name,
            preTask: '默认前置任务',
            taskStart: this.getNowDay(),
            taskEnd: this.getNowDay(),
            planDays: '1',
            actualDays: '1',
            state: 1
        };
        fetch(Config.host + '/add_projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(newData)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    showMessage(res.msg, 'success');
                    this.getProjects()
                } else {
                    showMessage(res.msg, 'error');
                }
            })
    };

    // 切换任务图状态
    mapToggle = () => {
        this.setState({
            mapSign: !this.state.mapSign
        })
    };
    // 保存任务
    handleSave = row => {
        fetch(Config.host + '/projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(row)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    let midData = [...this.state.dataSource];
                    for (let i = 0; i < midData.length; i++) {
                        if (midData[i]._id === row._id) {
                            midData[i] = row;
                        }
                        if (row.parentId && midData[i].children && midData[i].children.length > 0) {
                            for (let j = 0; j < midData[i].children.length; j++) {
                                if (midData[i].children[j]._id === row._id) {
                                    midData[i].children[j] = row
                                }
                            }
                        }

                    }
                    this.getProjects()
                }
            })
    };

    // 切换对应子任务显示隐藏
    toggleChart = (id) => {
        let data = this.state.dataTotal;
        data.forEach((item) => {
            if (item.parentId === id) {
                item.isShow = !item.isShow
            }
            if (item._id === id) {
                item.isOpen = !item.isOpen
            }
        });
        this.setState({
            dataTotal: data
        })
    };
    // 收起打开任务
    projects = () => {
        this.setState({
            dataTotal: JSON.parse(JSON.stringify(this.state.spareData)),
        })
    };



    // 设置前置任务
    preTask = (project) => {
        let midData = this.state.spareData,
            midArray = [];
        midData.forEach((item) => {
            const value = `${item.task}`;
            if (item._id !== project._id) {
                midArray.push({
                    value
                })
            }

        });
        this.setState({
            confirmProjectModal: true,
            options: midArray,
            project: project,
            projectSelected: project.preTask === '默认前置任务' ? undefined : project.preTask
        })
    };

    // 保存任务
    saveTask = (data) => {
        fetch(Config.host + '/projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(data)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    this.getProjects()
                }
            })
    }

    // 添加子任务
    addChildTask = (item) => {
        const {count} = this.state;

        const newData = {
            key: count,
            task: '默认子任务',
            taskId: 3,
            name: item.name,
            preTask: '默认前置任务',
            taskStart: this.getNowDay(),
            taskEnd: this.getNowDay(),
            planDays: '1',
            actualDays: '1',
            state: 1,
            parentId: item._id
        };
        fetch(Config.host + '/add_projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(newData)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    showMessage(res.msg, 'success');
                    this.getProjects()
                } else {
                    showMessage(res.msg, 'error');
                }
            })
    };

    // 设置前置任务确定
    confirmProjectModalOk = () => {

        let project = this.state.project;
        project.preTask = this.state.projectSelected;


        fetch(Config.host + '/projects', {
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(project)
        })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res.code === 200) {
                    showMessage(res.msg, 'success');
                    this.getProjects()
                }else {
                    showMessage(res.msg, 'error');
                }
            });
        this.setState({
            confirmProjectModal: false
        })
    };

    // 设置前置任务取消
    confirmProjectModalCancel = () => {
        this.setState({
            confirmProjectModal: false,
            projectSelected: undefined
        })
    };

    // 设置执行人取消
    confirmPersonModalCancel = () => {
        this.setState({
            confirmPersonModal: false
        })
    };

    // 设置执行人确定
    confirmPersonModalOk = () => {
        let data = this.state.activeItem;
        data.name = this.state.personSelected;

        if (this.state.personSelected) {
            this.saveTask(data);
            this.setState({
                confirmPersonModal: false,
                personSelected: undefined
            })
        }else {
            showMessage('执行人不能为空', 'error')
        }

    };

    // 设置任务名称
    editTask = (item) => {
        this.setState({
            confirmTaskModal: true,
            taskSelected: item.task,
            activeItem: item
        })
    };

    // 设置任务名称取消
    confirmTaskModalCancel = () => {
        this.setState({
            confirmTaskModal: false,
        })
    };

    // 设置任务名称确定
    confirmTaskModalOk = () => {
        let data = this.state.activeItem;
        data.task = this.state.taskSelected;
        this.setState({
            confirmTaskModal: false
        });
        this.saveTask(data)
    };

    // 前置任务下拉监听
    handleProjectChange = (value) => {
        let index = value.indexOf('#');
        value = value.slice(0, index);
        this.setState({
            projectSelected: value
        });
    };

    // 执行人下拉监听
    handlePersonChange = (value) => {
        let index = value.indexOf('#');
        value = value.slice(0, index);
        this.setState({
            personSelected: value
        });
    };

    // 任务名称变化
    handleTaskChange = (e) => {
        this.setState({
            taskSelected: e.target.value
        })
    };

    // 时间取消
    confirmTimeModalCancel = () => {
        this.setState({
            confirmTimeModal: false,
        })
    };

    // 时间变化
    handleTimeChange = (e, value) => {
        this.setState({
            editTaskTime: { start: value[0], end: value[1] }
        })
    };

    // 编辑时间
    editTime = (item) => {
        this.setState({
            confirmTimeModal: true,
            activeItem: item,
            editTaskTime: { start: item.taskStart, end: item.taskEnd }
        })
    };

    // 保存时间编辑
    confirmTimeModalOk = () => {
        let data = this.state.activeItem;
        data.taskStart = this.state.editTaskTime.start;
        data.taskEnd = this.state.editTaskTime.end;
        this.setState({
            confirmTimeModal: false
        });
        this.saveTask(data);
    };

    render() {
        return (
            <div className="container">
                {
                    this.state.mapSign && (<div className="chart">
                        <div>
                            <img
                                className={'operate_img data_operate add_operate'}
                                onClick={this.handleAdd}
                                src={require('../../static/img/add.png')}
                                alt=""
                            />
                            <img className={'operate_img data_operate'}
                                 src={require('../../static/img/account_balance.png')} alt=""/>
                            <img className={'operate_img data_operate'} onClick={this.projects.bind(this)}
                                 src={require('../../static/img/project.png')} alt=""/>
                            <img className={'operate_img data_operate'} src={require('../../static/img/personage.png')}
                                 alt=""/>
                        </div>

                        <table className={'projects_table'}>
                            <thead className={'table_header'}>
                            <tr>
                                {
                                    this.state.showChart.map((item, index) => {
                                            return (
                                                <th className={ this.getNowDay().slice(5) === item ? 'cell workDay' : 'cell'} key={index}> {item} </th>
                                            )
                                        }
                                    )
                                }
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.dataTotal.map((item) => {
                                    return (
                                        (item.isShow || !item.parentId) && (<tr title={item.task + '(' + item.name + ')'} key={item._id}>
                                            <td>
                                                <span className={'row_cell'}>
                                                    <span
                                                        className={'min_name'}
                                                        onClick={this.editName.bind(this, item)}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    <span className={'operate_btn'}>

                                                        {
                                                            (item.children && !item.parentId) &&
                                                            <img className={'operate_img'}
                                                                 onClick={this.toggleChart.bind(this, item._id)}
                                                                 src={require(item.isOpen ? '../../static/img/up.png' : '../../static/img/down.png')}
                                                                 alt="btn"/>
                                                        }
                                                    </span>
                                                </span>
                                            </td>
                                            <td>
                                                <span className={'direct_row'}>
                                                    {
                                                        item.parentId && <img className={'operate_img'}
                                                                              src={require('../../static/img/down-right-tum.png')}
                                                                              alt=""/>
                                                    }
                                                    <span className={'min_width'}>
                                                        <span className={'two_lines'} onClick={this.editTask.bind(this, item)}>
                                                            {item.task}
                                                        </span>
                                                    </span>
                                                    <img className={'operate_img'}
                                                         src={require('../../static/img/so-on.png')} alt=""/>
                                                    {
                                                        !item.parentId && <img className={'operate_img'}
                                                                               src={require('../../static/img/add.png')}
                                                                               onClick={this.addChildTask.bind(this, item)}
                                                                               alt=""
                                                        />
                                                    }
                                                </span>
                                            </td>
                                            <td><span onClick={this.editTime.bind(this, item)}>{item.taskStart}</span></td>
                                            <td><span onClick={this.editTime.bind(this, item)}>{item.taskEnd}</span></td>
                                            <td onClick={this.preTask.bind(this, item)}>
                                                {
                                                    item.preTask === '默认前置任务' ? <img className={'operate_img'}
                                                                                     src={require('../../static/img/pre-link.png')}
                                                                                     alt=""/> : item.preTask
                                                }
                                            </td>
                                            <td>{((new Date(item.taskEnd) - new Date(item.taskStart)) / (24 * 60 * 60 * 1000) + 1) * 8 || ''}</td>
                                            {
                                                this.state.dateArray.map(date => {
                                                    return item.taskStart && (
                                                        <td key={date}
                                                            className={(item.taskStart.substring(item.taskStart.length - 5, item.taskStart.length) <= ((new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (date < 9 ? '0' + (date + 1) : date + 1)) && item.taskEnd.substring(item.taskEnd.length - 5, item.taskEnd.length) >= ((new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (date < 9 ? '0' + (date + 1) : date + 1))) ? 'workDay' : ''}>
                                                        </td>
                                                    )
                                                })
                                            }
                                        </tr>)
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    </div>)
                }
                <Modal
                    title="提示信息"
                    centered
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.confirmModal}
                    onOk={() => this.confirmModalOk(false)}
                    onCancel={() => this.confirmModalCancel(false)}
                >
                    <p>删除不可恢复，你确定要删除么？</p>
                </Modal>


                <Modal
                    title="请选择任务关联"
                    centered
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.confirmProjectModal}
                    onOk={() => this.confirmProjectModalOk(false)}
                    onCancel={() => this.confirmProjectModalCancel(false)}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder="请选择"
                        onChange={this.handleProjectChange.bind(this)}
                        value={this.state.projectSelected}
                        // options={this.state.options}
                    >
                        {
                            this.state.options.map((item, index) => (
                                <Option key={index} value={item.value + '#' + index}>{item.value}</Option>
                            ))
                        }
                    </Select>
                </Modal>
                <Modal
                    title="请选择执行人"
                    centered
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.confirmPersonModal}
                    onOk={() => this.confirmPersonModalOk(false)}
                    onCancel={() => this.confirmPersonModalCancel(false)}
                >
                    <Select
                        style={{ width: '100%' }}
                        placeholder="请选择"
                        onChange={this.handlePersonChange.bind(this)}
                        value={this.state.personSelected}
                        // options={this.state.options}
                    >
                        {
                            this.state.options.map((item, index) => (
                                <Option key={index} value={item.name + '#' + index}>{item.name}</Option>
                            ))
                        }
                    </Select>
                </Modal>
                <Modal
                    title="请输入任务名称"
                    centered
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.confirmTaskModal}
                    onOk={() => this.confirmTaskModalOk(false)}
                    onCancel={() => this.confirmTaskModalCancel(false)}
                >
                    <Input
                        value={this.state.taskSelected}
                        placeholder={"请输入任务名称"}
                        onChange={this.handleTaskChange.bind(this)}
                    />
                </Modal>
                <Modal
                    title="请选择任务周期"
                    centered
                    okText={'确定'}
                    cancelText={'取消'}
                    visible={this.state.confirmTimeModal}
                    onOk={() => this.confirmTimeModalOk(false)}
                    onCancel={() => this.confirmTimeModalCancel(false)}
                >
                    <RangePicker
                        value={[moment(this.state.editTaskTime.start, dateFormat), moment(this.state.editTaskTime.end, dateFormat)]}
                        onChange={this.handleTimeChange.bind(this)}
                    />
                </Modal>
            </div>

        );
    }
}
