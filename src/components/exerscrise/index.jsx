import React from 'react';
import "./index.scss";
import { examClient,imClient } from "../../common/serve/imServe.js";
import paramServer from "../../common/js/paramServer";
import moment from 'moment';

import {
    Row,
    Col,
    Icon,
    Select,
    Modal,
    Table,
    Button,
    Input,
    Radio,
    Textarea
  } from "@ucloud-fe/react-components";
let questionsList = [];
class Exerscrise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        exerciseDisplay:false,
        createExamDisplay:false,
        examDetailDisplay:false,
        examStartDisplay:false,
        exerciseDataSource:[],
        questionList:[0],
        examDetailData:{},
        examName:'',
        examDes:'',
        quesData:{},
        examDetailTile:'',
        examStartData:{},
        questionArr:[]
    };
    // this.online = this.online.bind(this);
    this.exercrise = this.exercrise.bind(this);
    this.createExam = this.createExam.bind(this);
    this.backExamList = this.backExamList.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.examName = this.examName.bind(this);
    this.examDes = this.examDes.bind(this);
    this.quesArr = this.quesArr.bind(this);
    this.subNewQues = this.subNewQues.bind(this);
    this.quesCheck = this.quesCheck.bind(this);
    this.examLink = this.examLink.bind(this);
    this.backExamL = this.backExamL.bind(this);
    this.delExam = this.delExam.bind(this);
    this.sendExam = this.sendExam.bind(this);
    this.subExam = this.subExam.bind(this);
    this.answerExam = this.answerExam.bind(this);
    // 
  }
  componentWillReceiveProps() {
    // this.data = this.props;
    
  }
  componentDidMount(){
      const _this = this;
    imClient.on("CustomContent", array => {
        let examRevData = JSON.parse(array.content)
        let state = this.state;
       if(examRevData.ExamRecordId && (state.ExamRecordId != examRevData.ExamRecordId)){
            _this.setState({
                examStartData:examRevData,
                examStartDisplay:true
        })
       }
       console.log(state.ExamRecordId,examRevData.ExamRecordId)
    });
  }
  exercrise(){
    this.setState({
        exerciseDisplay:true
    })
    const _this = this;
    examClient.getExamList(
        function(data){
            //题目数组
            console.log(data)
            data.map((v, i) => {
                   v.key = v.ExamId;
                })
            _this.setState({
                exerciseDataSource:data
            })
        },
        function(err){
            console.log(err)
        }
    )
    
  }
  createExam(){
    this.setState({
        exerciseDisplay:false,
        createExamDisplay:true,
        quesData:{},
        questionList:[0]
    })

  }
  backExamList(){
    this.setState({
        exerciseDisplay:true,
        createExamDisplay:false,
    })
    const _this = this;
    examClient.getExamList(
        function(data){
            //题目数组
            console.log(data)
            data.map((v, i) => {
                //    v.CreateTime = new Date(v.CreateTime*1000); 
                //    v.UpdateTime = new Date(v.UpdateTime*1000); 
                   v.key = v.ExamId;
                })
            _this.setState({
                exerciseDataSource:data
            })
        },
        function(err){
            console.log(err)
        }
    )
  }
  addQuestion(){
    let questionList = this.state.questionList
    questionList.push(1);
    this.setState({
        questionList:questionList
    })
  }
  examName(e){
    let quesData = this.state.quesData
    quesData.examName = e.target.value;
    this.setState({
        quesData:quesData
    })
  }
  examDes(e){
    let quesData = this.state.quesData
    quesData.examDes = e.target.value;
    this.setState({
        quesData:quesData
    })
  }
  quesArr(e){
      const target = e.target
      const value = target.value;
      const name = target.name;
      let quesData = this.state.quesData
      quesData[name] = value
      this.setState({
        quesData:quesData
      })
  }
  quesCheck(e,name){
      
  }
  subNewQues(){
      console.log(this.state)
      const state = this.state;
      const quesData = this.state.quesData;
      let Questions = [];
      const _this = this;
      state.questionList.map(function(e,v){
        let Ques = {};
        let Choices = [];
        let IsRight = false;
        let qtitle = 'qtitle' + v;
        let checked = 'checked'+v;
        let choicesA = 'choicesA'+v;
        let choicesB = 'choicesB'+v;
        let choicesC = 'choicesC'+v;
        let choicesD = 'choicesD'+v;
        Ques.Type = 'radio';
        Ques.Title = quesData[qtitle];
        Ques.RightAnswer = quesData[checked];
        Ques.Choices =[{
            'Sn':'A',
            'Desc':quesData[choicesA],
            'IsRight':IsRight,
        },{
            'Sn':'B',
            'Desc':quesData[choicesB],
            'IsRight':IsRight,
        },{
            'Sn':'C',
            'Desc':quesData[choicesC],
            'IsRight':IsRight,
        },{
            'Sn':'D',
            'Desc':quesData[choicesD],
            'IsRight':IsRight,
        }]
        if(!quesData[checked]){
            Ques.RightAnswer = 'A';
            Ques.Choices[0].IsRight = true; 
        }
        Ques.Choices.map(function(e){
            console.log(e.Sn,quesData[checked])
            if(e.Sn == quesData[checked]){
                e.IsRight = true;
            }
            
        })
        Questions.push(Ques);
      })
      console.log(Questions)
      console.log(this.state)
      examClient.add(
        quesData.examName,
        quesData.examDes,
        Questions,
        function(e){
            console.log(e)
            _this.setState({
                exerciseDisplay:true,
                createExamDisplay:false,
            })
        })
    examClient.getExamList(
        function(data){
            //题目数组
            console.log(data)
            data.map((v, i) => {
                   v.key = v.ExamId;
                })
            _this.setState({
                exerciseDataSource:data
            })
        },
        function(err){
            console.log(err)
        }
    )
  }
  examLink(e){
      console.log(e)
    this.setState({
        exerciseDisplay:false,
        examDetailDisplay:true,
        examDetailTile:e.Name
    })
    const _this=this;
    examClient.getDescribe(e.ExamId,function(e){
        console.log(e)
        _this.setState({
            examDetailData:e
        })
    })
  }
  backExamL(){
    this.setState({
        exerciseDisplay:true,
        examDetailDisplay:false,
    })
  }
  sendExam(e){
    console.log(e)
    console.log(this.state)
    const params = this.props.roomId.params;
    console.log(params)
    const _this = this;
    examClient.start(
        params.roomId,
        e.ExamId,
        function(e){
            console.log("start >>> " ,e)
            _this.setState({
                ExamRecordId:e.ExamRecordId
            })
        }
    )
    
  }
  delExam(e){
    console.log(e)
    examClient.delExam(
        e.ExamId,
        function(e){
            console.log("delete >>> " ,e)
        }
    )
    const _this = this;
    examClient.getExamList(
        function(data){
            //题目数组
            console.log(data)
            data.map((v, i) => {
                   v.key = v.ExamId;
                })
            _this.setState({
                exerciseDataSource:data
            })
        },
        function(err){
            console.log(err)
        }
    )
  }
  subExam(e,v){
      console.log(this.props)
      console.log(this.state)
      let params = this.props.roomId.params;
      let examStartData = this.state.examStartData;
      let questionArr = this.state.questionArr;
      let SubmitTime = Date.parse(new Date())/1000;
      const _this = this;
      examClient.submit(
        params.roomId,
        params.userId,
        examStartData.Id,
        examStartData.ExamRecordId,
        SubmitTime,
        questionArr,
        function(e){
            _this.setState({
                examStartDisplay:false
            })
        }
    )
    
    
  }
  getStatExam(e){
    let params = this.props.roomId.params;
    let examStartData = this.state.examStartData
    console.log(params)
    console.log(e)
    console.log(this.state)
    examClient.getStat(
        params.roomId,
        params.userId,
        e.ExamId,
        examStartData.ExamRecordId,
        function(e){
            console.log(e)
        }
    )
  }
  answerExam(e){
    let questionArr = this.state.questionArr;
    questionArr.push(e)
    this.setState({
        questionArr:questionArr
    })
  }

  render() {
    const {
        exerciseDisplay,
        exerciseDataSource,
        createExamDisplay,
        questionList,
        examDetailDisplay,
        examDetailTile,
        quesData,
        examDetailData,
        examStartData,
        examStartDisplay
      } = this.state;
    console.log(examDetailData.Questions)
    const columns = [{
            title: '试卷名称',
            dataIndex: 'Name',
            key: 'Name',
            // width: 200,
            render: (e,v) => {
                console.log(v.ExamId)
                return(
                    <span onClick={()=>this.examLink(v)} className="exam-link">{e}</span>
                )
            }
        },{
            title: '试卷描述',
            dataIndex: 'Desc',
            key: 'Desc',
            render: record => <div style={{width:'100px'}}>{record}</div>
        },{
            title: '创建时间',
            dataIndex: 'CreateTime',
            key: 'CreateTime',
            render: record => <div style={{width:'80px'}}>{moment(record * 1000).format('YYYY/MM/DD HH:mm:ss')}</div>
            //moment(sendUser.LastEnterTime * 1000).format('YYYY/MM/DD HH:mm:ss')
        },{
            title: '更新时间',
            dataIndex: 'UpdateTime',
            key: 'UpdateTime',
            render: record => <div style={{width:'80px'}}>{moment(record * 1000).format('YYYY/MM/DD HH:mm:ss')}</div>
        },{
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (e,v) => {
                return(
                    <div>
                        <Button onClick={()=>this.sendExam(v)}>发送试卷</Button>
                        {/* <Button onClick={()=>this.getStatExam(v)} className="getStat-exam">试卷统计</Button> */}
                        <Button onClick={()=>this.delExam(v)} className="delete-exam">删除</Button>
                    </div>
                )
            }
        }]
    return (
        <div>
            <div className="exercrise fr" onClick={this.exercrise}>
                <Icon className="stack" type="survey" />
                课堂测试
            </div>
            <Modal
          visible={exerciseDisplay}
          onClose={() =>
            this.setState({
                exerciseDisplay: false
            })
          }
          onOk={() => this.setState({
            exerciseDisplay: false
        })}
          isAutoClose={false}
          size={"md"}
          title="课堂测试"
        >
          <div>
                <Table
                    title={() => (
                        <div>
                            <Button onClick={this.createExam} styleType="primary">创建试卷</Button>
                        </div>
                    )}
                    dataSource={exerciseDataSource}
                    columns={columns}
                />
          </div>

        </Modal>
        <Modal
          visible={createExamDisplay}
          onClose={() =>
            this.setState({
                createExamDisplay: false
            })
          }
          onOk={this.subNewQues}
          isAutoClose={false}
          size={"md"}
          title="课堂测试"
        >
            <div className="create-exam" onClick={this.backExamList}>
                <Button size="sm"><Icon type="left" /></Button>
                创建试卷
            </div>
            <div className="exam-data">
                <div className="exam-title">
                    <span className="content-title">试卷名字：</span>
                    <Input onChange={this.examName} style={{ width: 300 }} />
                </div>
                <div className="exam-des">
                    <span className="content-title">试卷描述：</span>
                    <Textarea onChange={this.examDes} className="exam_des-textarea" placeholder="试卷描述" style={{ width: 300 }} />
                </div>
                {questionList.map((e,v)=>{
                    let checkname = 'checked'+v;
                    
                    return(<div className="exam-content" key={v}>
                    单选题{v+1}名称：
                    <Input name={'qtitle'+v} onChange={this.quesArr}  style={{ width: 300 }} placeholder="题目描述" />
                    <Radio.Group className="exam-options" name={'checked'+v} onChange={v => {
                        quesData[checkname] = v;
                        this.setState({quesData:quesData})
                    }} defaultValue={'A'}>
                        <div className="option-item">
                            <Radio className="option-radio" value="A"></Radio>
                            A：<Input name={'choicesA'+v} onChange={this.quesArr}  style={{ width: 300 }} placeholder="选项描述" />
                        </div>
                        <div className="option-item">
                        <Radio className="option-radio" value="B"></Radio>
                        B：<Input name={'choicesB'+v} onChange={this.quesArr}  style={{ width: 300 }} placeholder="选项描述" />
                        </div>
                        <div className="option-item">
                        <Radio className="option-radio" value="C"></Radio>
                        C：<Input name={'choicesC'+v} onChange={this.quesArr}  style={{ width: 300 }} placeholder="选项描述" />
                        </div>
                        <div className="option-item">
                        <Radio className="option-radio" value="D"></Radio>
                        D：<Input name={'choicesD'+v} onChange={this.quesArr}  style={{ width: 300 }} placeholder="选项描述" />
                        </div>
                    </Radio.Group>
                </div>)
                })}
                <Button onClick={this.addQuestion} className="add-question">增加一题</Button>
                
            </div>
        </Modal>
        <Modal
          visible={examDetailDisplay}
          onClose={() =>
            this.setState({
                examDetailDisplay: false
            })
          }
          onOk={() => this.backExamL()}
          isAutoClose={false}
          size={"md"}
          title="课堂测试"
        >
          <div>
          <div className="create-exam" onClick={this.backExamL}>
                <Button size="sm"><Icon type="left" /></Button>
                {examDetailTile}详情
            </div>
            <div className="detail-wrapper">
                <div className="detail-title">{examDetailData.Name}</div>
                <div className="detail-des">{examDetailData.Desc}</div>
                {!!examDetailData.Questions&&examDetailData.Questions.map((e,v)=>{
                    console.log(e)
                    return(
                        <div className="detail-list">
                            <span className="detail_ques-title">问题{v+1}：{e.Title}</span>
                            <span className="detail-answer">答案：{e.RightAnswer}</span>
                            {e.Choices.map((data)=>{
                                return(
                                    <div className="detail-item">{data.Sn}： {data.Desc}</div>
                                    )
                            })}
                        </div>
                    )
                })}
            </div>
          </div>

        </Modal>
        <Modal
          visible={examStartDisplay}
          onClose={() =>
            this.setState({
                examStartDisplay: false
            })
          }
          onOk={() => this.backExamL()}
          isAutoClose={false}
          size={"md"}
          title="课堂测试"
          footer={
              ()=>{
                return(
                    <Button onClick={this.subExam}>提交试卷</Button>
                  )
              }
          }
        >
          <div>
          
            <div className="detail-wrapper">
                <div className="detail-title">{examStartData.Name}</div>
                <div className="detail-des">{examStartData.Desc}</div>
                {!!examStartData.Questions&&examStartData.Questions.map((e,v)=>{
                    console.log(e)
                    return(
                        <div className="detail-list">
                            <span className="detail_ques-title">问题{v+1}：{e.Title}</span>
                            <Radio.Group onChange={v=>{
                                console.log(e,v)
                                this.answerExam({
                                    QuestionId:e.QuestionId,
                                    UserAnswer:v
                                })
                            }}>
                                {e.Choices.map((data)=>{
                                    return(
                                        <div className="detail-item"><Radio className="option-radio" value={data.Sn}></Radio>{data.Sn}： {data.Desc}</div>
                                        )
                                })}
                            </Radio.Group>
                        </div>
                    )
                })}
            </div>
          </div>

        </Modal>
    </div>
    );
  }
}

export default Exerscrise;
