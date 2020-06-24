import React, {Component} from 'react';
import {Table, Input, Button, Popconfirm, Form, Modal, Select} from 'antd';
import './Projects.css'
import {Config} from '../../config'
import {showMessage} from "../Untils/untils";

const { Option } = Select;

const EditableContext = React.createContext();

const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);


// const expandedRowRender = record => <p>{record.name}</p>;

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {

    state = {
        editing: false,
    };

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({editing}, () => {
            if (editing) {
                this.input.focus();
            }
        });
    };


    save = e => {
        const {record, handleSave} = this.props;
        this.form.validateFields((error, values) => {
            if (error && error[e.currentTarget.id]) {
                return;
            }
            this.toggleEdit();
            handleSave({...record, ...values});
        });
    };


    renderCell = form => {
        this.form = form;
        const {children, dataIndex, record, title} = this.props;
        const {editing} = this.state;
        return (editing) ? (
            <Form.Item style={{margin: 0}}>
                {form.getFieldDecorator(dataIndex, {
                    /*rules: [
                        {
                            required: true,
                            message: `${title} is required.`,
                        },
                    ],*/
                    initialValue: record[dataIndex],
                })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save}/>)}
            </Form.Item>
        ) : (
            <div
                className={`editable-cell-value-wrap ${dataIndex === 'remark' ? 'remark' : ''}`}
                style={{paddingRight: 24}}
                onClick={this.toggleEdit}
                title={dataIndex === 'remark' ? record.remark : ''}

            >
                {children}
            </div>
        );
    };

    render() {
        let user = JSON.parse(localStorage.getItem('USER'));
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            children,
            ...restProps
        } = this.props;

        return (
            <td {...restProps}>
                {(editable && (user.auth > 4 || dataIndex !== 'name')) ? (
                    <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
                ) : (
                    children
                )}
            </td>
        );
    }
}



function handleChange(value) {
    console.log(`selected ${value}`);
}


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
            delId: '',
            dataTotal: [],
            spareData: [], // 备用数据 -- 用于重置任务状态-收起任务
            options: [],
            projectSelected: undefined,
            project: {}
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
        showChart = [...showChart, ...daysArray]
        this.setState({
            showChart
        });

        this.getProjects();
        console.log(this.getNowDay());
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
                    let chartData = [];
                    /* res.data.forEach(function (item) {
                         if (item.projects.length > 0) {
                             tagData.push(...item.projects);
                             item.projects.forEach((pro) => {
                                 chartData.push(pro);
                                 if (pro.children) {
                                     chartData = [...chartData, ...pro.children]
                                 }
                             })
                         }
                     });*/
                    tagData = res.data;
                    tagData.forEach((item, index) => {
                        item.key = item._id + index;
                        item.children && item.children.forEach((child, childIndex) => {
                            tagData.splice(index + childIndex + 1, 0, child);
                            child.key = child._id + childIndex;
                        })
                    });
                    this.setState({
                        dataSource: tagData,
                        count: res.data.length,
                        dataTotal: tagData,
                        spareData: JSON.parse(JSON.stringify(tagData))
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
    }

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
        console.log(this.getNowDay().slice(5));
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
        console.log(project.preTask);
        this.setState({
            confirmProjectModal: true,
            options: midArray,
            project: project,
            projectSelected: project.preTask === '默认前置任务' ? undefined : project.preTask
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
                console.log(res);
                if (res.code === 200) {
                    this.getProjects()
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

    // 前置任务下拉监听
    handleProjectChange = (value) => {
        let index = value.indexOf('#');
        value = value.slice(0, index);
        this.setState({
            projectSelected: value
        });
    };
    render() {
        const {dataSource} = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div className="container">
                <div id="projects">
                    <Button onClick={this.handleAdd} type="primary" style={{marginBottom: 16}}>
                        新增主任务
                    </Button>
                    <Button onClick={this.mapToggle} type="primary" style={{marginBottom: 16, float: 'right'}}>
                        {
                            this.state.mapSign ? '隐藏任务分布图' : '显示任务分布图'
                        }
                    </Button>
                    {/*   <Table
                        components={components}
                        rowClassName={() => 'editable-row'}
                        // bordered
                        dataSource={dataSource}
                        columns={columns}
                    />*/}
                </div>
                {
                    this.state.mapSign && (<div className="chart">
                        <div>
                            <img className={'operate_img data_operate add_operate'}
                                 src={require('../../static/img/add.png')} alt=""/>
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
                                                <th className={ this.getNowDay().slice(5) == item ? 'cell workDay' : 'cell'} key={index}> {item} </th>
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
                                        (item.isShow || !item.parentId) && (<tr key={item._id}>
                                            <td>
                                                <span className={'row_cell'}>
                                                    {item.name}
                                                    <span className={'operate_btn'}>

                                                        {
                                                            (item.children && !item.parentId) &&
                                                            <img className={'operate_img'}
                                                                 onClick={this.toggleChart.bind(this, item._id)}
                                                                 src={require(item.isOpen ? '../../static/img/up.png' : '../../static/img/down.png')}
                                                                 alt="btn"/>
                                                            // <span className={'toggle_child'} onClick={this.toggleChart.bind(this, item._id)}>{ '-' : '+'}</span>
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
                                                    <span className={'minWidth'}>
                                                        {item.task}
                                                    </span>
                                                    <img className={'operate_img'}
                                                         src={require('../../static/img/so-on.png')} alt=""/>
                                                    {
                                                        !item.parentId && <img className={'operate_img'}
                                                                               src={require('../../static/img/add.png')}
                                                                               alt=""/>
                                                    }
                                                </span>
                                            </td>
                                            <td>{item.taskStart}</td>
                                            <td>{item.taskEnd}</td>
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
                                                            className={(item.taskStart.substring(item.taskStart.length - 2, item.taskStart.length) <= (date + 1) && item.taskEnd.substring(item.taskEnd.length - 2, item.taskEnd.length) >= (date + 1)) ? 'workDay' : ''}>
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
            </div>

        );
    }
}
