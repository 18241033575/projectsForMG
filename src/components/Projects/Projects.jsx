import React, {Component} from 'react';
import {Input, Modal, Select, DatePicker, Button} from 'antd';
import './Projects.css'
import {Config} from '../../config'
import {showMessage} from "../Untils/untils";
import moment from 'moment';

const {RangePicker} = DatePicker;
const {Option} = Select;
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
            addNewTask: false,
            delId: '',
            dataTotal: [],
            spareData: [], // 备用数据 -- 用于重置任务状态-收起任务
            options: [],
            projectSelected: undefined,
            personSelected: undefined,
            taskSelected: undefined,
            project: {},
            activeItem: {},
            editTaskTime: {},
            addProjects: {
                name: '',
                task: '',
                start: '开始时间',
                end: '结束时间',
                preTask: '默认前置任务'
            },
            resetAddProjects: {
                name: '',
                task: '',
                start: '开始时间',
                end: '结束时间',
                preTask: '默认前置任务'
            }
        };

    }


    componentWillMount() {

        // 获取当前月份每天数组
        let showChart = [{name: '负责人'}, {name: '任务名称'}, {name: '开始时间'}, {name: '结束时间'}, {name: '依赖'}, {name: '小时'}];
        let daysArray = [];
        const days = this.getDays();
        console.log(new Date().getFullYear());
        this.getDateArray();
        for (let i = 1; i < days + 1; i++) {
            daysArray.push({
                name: (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (i < 10 ? '0' + i : i),
                week: this.getWeekDay(new Date().getFullYear() + '-' + (new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (i < 10 ? '0' + i : i))
            })
        }
        showChart = [...showChart, ...daysArray];
        this.setState({
            showChart
        });

        this.getProjects();
    }

    // 获取当天是星期几
    getWeekDay = (fullDate) => {
        let data = fullDate.split('-');
        let nowDate = new Date();
        nowDate.setFullYear(data[0], data[1] - 1, data[2]);
        let week = nowDate.getDay();

        switch (week) {
            case 0:
                return '日';
            case 1:
                return '一';
            case 2:
                return '二';
            case 3:
                return '三';
            case 4:
                return '四';
            case 5:
                return '五';
            case 6:
                return '六';
        }
    };

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
        if (item._id) {
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
        } else {
            let user = JSON.parse(localStorage.getItem('USER'));
            fetch(Config.host + '/groupMember', {
                method: 'POST',
                headers: {'Content-type': 'application/json'},
                body: JSON.stringify({name: user.name, all: true})
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
                activeItem: {},
                confirmPersonModal: true
            })
        }

    };

    // 添加主任务
    handleAdd = () => {

        this.setState({
            addNewTask: true,
            addProjects: JSON.parse(JSON.stringify(this.state.resetAddProjects))
        });
    };

    // 添加主任务  --  取消
    newTaskCancel = () => {
        this.setState({
            addNewTask: false,
        })
    };

    // 添加主任务  --  确定
    newTaskConfirm = () => {
        let data = this.state.addProjects;
        if (!data.name) {
            showMessage('请选择负责人', 'error');
            return
        }
        if (!data.task) {
            showMessage('请输入任务名称', 'error');
            return
        }
        if (data.start === '开始时间' || data.end === '结束时间') {
            showMessage('请选择任务周期', 'error');
            return
        }

        const {count} = this.state;

        const newData = {
            key: count,
            task: data.task,
            name: data.name,
            preTask: data.preTask,
            taskStart: data.start,
            taskEnd: data.end,
            planDays: '1',
            actualDays: '1',
            state: 1,
            isDepend: 0
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
                    this.getProjects();
                    this.newTaskCancel();
                } else {
                    showMessage(res.msg, 'error');
                }
            })

    };

    // 新增主任务变化
    addTaskChange = ({target: {value}}) => {
        let data = this.state.addProjects;
        data.task = value;
        this.setState({
            addProjects: data
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
    };

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
                } else {
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
        if (data._id) {
            data.name = this.state.personSelected;

            if (this.state.personSelected) {
                this.saveTask(data);
                this.setState({
                    confirmPersonModal: false,
                    personSelected: undefined
                })
            } else {
                showMessage('执行人不能为空', 'error')
            }
        } else {
            let midData = this.state.addProjects;
            midData.name = this.state.personSelected;
            this.setState({
                addProjects: midData,
                confirmPersonModal: false
            })
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
        if (this.state.activeItem._id) {
            this.setState({
                editTaskTime: {start: value[0], end: value[1]}
            })
        } else {
            let data = this.state.addProjects;
            data.start = value[0];
            data.end = value[1];
            this.setState({
                addProjects: data
            })
        }

    };

    // 编辑时间
    editTime = (item) => {
        // 有item 编辑， 无新增
        if (item._id) {
            this.setState({
                confirmTimeModal: true,
                activeItem: item,
                editTaskTime: {start: item.taskStart, end: item.taskEnd}
            })
        } else {
            this.setState({
                confirmTimeModal: true,
                activeItem: {},
                editTaskTime: {
                    start: this.state.addProjects.start === '开始时间' ? this.getNowDay() : this.state.addProjects.start,
                    end: this.state.addProjects.end === '结束时间' ? this.getNowDay() : this.state.addProjects.end
                }
            })
        }

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
                                                <th className={['cell', this.getNowDay().slice(5) === item.name ? 'workDay' : '']}
                                                    key={index}>
                                                    <p> {item.week}</p>
                                                    <p> {item.name}</p>
                                                </th>
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
                                        (item.isShow || !item.parentId) && (
                                            <tr title={item.task + '(' + item.name + ')'} key={item._id}>
                                                <td>
                                                <span className={'row_cell'}>
                                                    <span
                                                        className={'min_name'}
                                                        onClick={this.editName.bind(this, item)}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    <span
                                                        className={['operate_btn' ,   !item.parentId ? 'main_task' : '']}>

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
                                                        <span className={'two_lines'}
                                                              onClick={this.editTask.bind(this, item)}>
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
                                                <td><span className={'two_lines'}
                                                          onClick={this.editTime.bind(this, item)}>{item.taskStart}</span>
                                                </td>
                                                <td><span className={'two_lines'}
                                                          onClick={this.editTime.bind(this, item)}>{item.taskEnd}</span>
                                                </td>
                                                <td onClick={this.preTask.bind(this, item)}>
                                                <span className={'two_lines depend'}>
                                                    {
                                                        item.preTask === '默认前置任务' ? <img className={'operate_img'}
                                                                                         src={require('../../static/img/pre-link.png')}
                                                                                         alt=""/> : item.preTask
                                                    }
                                                </span>
                                                </td>
                                                <td>{((new Date(item.taskEnd) - new Date(item.taskStart)) / (24 * 60 * 60 * 1000) + 1) * 8 || ''}</td>
                                                {
                                                    this.state.dateArray.map(date => {
                                                        return item.taskStart && (
                                                            <td key={date}
                                                                className={[(item.taskStart.substring(item.taskStart.length - 5, item.taskStart.length) <= ((new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (date < 9 ? '0' + (date + 1) : date + 1)) && item.taskEnd.substring(item.taskEnd.length - 5, item.taskEnd.length) >= ((new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1)) + '-' + (date < 9 ? '0' + (date + 1) : date + 1))) ? 'workDay' : '', ]}>
                                                            </td>
                                                        )
                                                    })
                                                }
                                            </tr>
                                        )
                                    )
                                })
                            }
                            {
                                this.state.addNewTask && <tr>
                                    <td onClick={this.editName.bind(this)}>{this.state.addProjects.name ||
                                    <img className={'operate_img data_operate'}
                                         src={require('../../static/img/add_user.png')} alt=""/>}</td>
                                    <td><Input type="text" onChange={this.addTaskChange.bind(this)}
                                               placeholder={'请输入任务名称'} value={this.state.addProjects.task}/></td>
                                    <td onClick={this.editTime.bind(this)}>{this.state.addProjects.start}</td>
                                    <td onClick={this.editTime.bind(this)}>{this.state.addProjects.end}</td>
                                    <td>{this.state.addProjects.preTask === '默认前置任务' ? <img className={'operate_img'}
                                                                                            src={require('../../static/img/pre-link.png')}
                                                                                            alt=""/> : this.state.addProjects.preTask}</td>
                                    <td><Button onClick={this.newTaskConfirm.bind(this)} type={'primary'}>保存</Button>
                                    </td>
                                    <td><Button onClick={this.newTaskCancel.bind(this)}>取消</Button></td>
                                </tr>
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
                        style={{width: '100%'}}
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
                        style={{width: '100%'}}
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
                        allowClear={false}
                        value={[moment(this.state.editTaskTime.start, dateFormat), moment(this.state.editTaskTime.end, dateFormat)]}
                        onChange={this.handleTimeChange.bind(this)}
                    />
                </Modal>
            </div>

        );
    }
}
