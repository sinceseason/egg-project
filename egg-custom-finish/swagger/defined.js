/**
 * @swagger
 * definitions:
 *  Operation:
 *    schema:
 *      type: 'array'
 *      example: [1]
 *  QuestionExamine:
 *    properties:
 *      createTime:
 *        type: "date"
 *        example: 2019-08-21 10:23:49
 *      id:
 *        type: "number"
 *        example: 1566354229221388
 *      userId:
 *        type: "number"
 *        example: 1566354229221388
 *      correctOptions:
 *        type: "string"
 *        description: '参考答案'
 *        example: '0,1,1'
 *      type:
 *        type: "number"
 *        description: '试卷类型'
 *        example: 0
 *      questions:
 *        type: "array"
 *        items:
 *          $ref: "#/definitions/Question"
 *  Question:
 *    properties:
 *      id:
 *        type: "number"
 *        example: 1566354229221388
 *      content:
 *        type: "string"
 *        example: '发行人以筹资为目的，按照一定的法律规定，向投资者出售新证券形成的市场称为()。 (单项选择题)'
 *      options:
 *        type: "string"
 *        example: '一级市场,二级市场,二板市场,三板市场"'
 *      correctOption:
 *        type: "string"
 *        example: '0'
 *      level:
 *        type: "number"
 *        example: 1
 *      type:
 *        type: "number"
 *        example: 1
 *      analysis:
 *        type: "number"
 *        example: '暂无'
 *  QuestionAnswerRecord:
 *    properties:
 *      id:
 *        type: "number"
 *        example: 1566354229221388
 *      questionId:
 *        type: "number"
 *        example: 1566354229221388
 *      userId:
 *        type: "number"
 *        example: 1566354229221388
 *      options:
 *        type: "string"
 *        example: '1,2'
 *      createTime:
 *        type: "date"
 *        example: 2019-08-21 10:23:49
 *      isCorrect:
 *        type: "boolean"
 *        example: true
 *      question:
 *        $ref: "#/definitions/Question"
 *  QuestionStore:
 *    properties:
 *      id:
 *        type: "number"
 *        example: 1566354229221388
 *      iconPath:
 *        type: "string"
 *        example: ''
 *      name:
 *        type: "number"
 *        example: 'xxx'
 *      parentId:
 *        type: "number"
 *        example: '1566354229221388'
 *
 *  PunchRecord:
 *    properties:
 *      id:
 *        type: "number"
 *        example: 1566354229221388
 *      currectRate:
 *        type: "number"
 *        example: 0
 *      isFinish:
 *        type: "boolean"
 *        example: true
 *      punchTime:
 *        type: "date"
 *        example: 2019-08-21 10:23:49
 *      createTime:
 *        type: "date"
 *        example: 2019-08-21 10:23:49
 *
 */
