/**
 * @swagger
 * paths:
 *  /question/examine:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    get:
 *      tags:
 *      - 'question'
 *      summary: '查询试题'
 *      description: '查询试题'
 *      parameters:
 *        - name: 'random'
 *          in: 'query'
 *          description: '题目随机（0：不随机，1：随机）'
 *          type: 'number'
 *        - name: 'limit'
 *          in: 'query'
 *          description: '题目数量'
 *          type: 'number'
 *        - name: 'storeId'
 *          in: 'query'
 *          description: '题目分类 ID'
 *          type: 'number'
 *          default: 2
 *        - name: 'model'
 *          in: 'query'
 *          default: 0
 *          description: '题目条数（0：题库练习，1：打卡测试）'
 *          type: 'number'
 *          enum:
 *            - 0
 *            - 1
 *        - name: 'level'
 *          in: 'query'
 *          description: '题目难度（0：初级，1：中级，2：高级）'
 *          type: 'number'
 *          enum:
 *            - 0
 *            - 1
 *            - 2
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  $ref: "#/definitions/QuestionAnswerRecord"
 *  /question/examine/{id}:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    post:
 *      tags:
 *      - 'question'
 *      description: '提交试卷答案'
 *      summary: '提交试卷答案'
 *      parameters:
 *        - name: 'id'
 *          in: 'path'
 *          description: '试题 ID'
 *          type: 'number'
 *          default: 1566451274048378
 *        - name: 'options'
 *          in: 'formData'
 *          required: true
 *          type: 'string'
 *          default: '1,2,3,4'
 *          description: '题目选项（1,2,3,4）'
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  properties:
 *                    questionExamine:
 *                      $ref: "#/definitions/QuestionExamine"
 *                    correctCount:
 *                      type: number
 *                      example: 2
 *                      default: 回答正确数
 *                    answerCount:
 *                      type: number
 *                      example: 2
 *                      default: 总答题数
 *  /question/check/{id}:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    post:
 *      tags:
 *      - 'question'
 *      summary: '核对每题答案'
 *      description: '核对每题答案'
 *      parameters:
 *        - name: 'id'
 *          in: 'path'
 *          description: '题目 ID'
 *          type: 'number'
 *          default: 1566364771963692
 *        - name: 'options'
 *          in: 'formData'
 *          description: '选项'
 *          type: 'string'
 *          default: '1,2'
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  $ref: "#/definitions/QuestionAnswerRecord"
 *  /question/note/{id}:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    post:
 *      tags:
 *      - 'question'
 *      summary: '记录笔记'
 *      description: '记录笔记'
 *      parameters:
 *        - name: 'id'
 *          in: 'path'
 *          description: '答题记录 ID'
 *          type: 'number'
 *          default: 1566451763506898
 *        - name: 'note'
 *          in: 'formData'
 *          description: '笔记'
 *          type: 'string'
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  type: "array"
 *                  example: [1]
 *  /question/answerRecord:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    get:
 *      tags:
 *      - 'question'
 *      summary: '答题记录查询（错题库）'
 *      description: '答题记录查询'
 *      parameters:
 *        - name: 'page'
 *          in: 'path'
 *          description: 页码'
 *          type: 'number'
 *          default: 1
 *        - name: 'pageSize'
 *          in: 'path'
 *          description: '条数'
 *          type: 'number'
 *          default: 10
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  properties:
 *                    list:
 *                      type: 'array'
 *                      items:
 *                        $ref: "#/definitions/QuestionAnswerRecord"
 *                    totalCount:
 *                      type: 'number'
 *                      example: 1
 *  /question/highErrorRateAnswerRecord:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    get:
 *      tags:
 *      - 'question'
 *      summary: '经典错题查询'
 *      description: '经典错题查询'
 *      parameters:
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: "#/definitions/QuestionAnswerRecord"
 *  /question/store:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    get:
 *      tags:
 *      - 'question'
 *      summary: '题库分类查询'
 *      description: '题库分类查询'
 *      parameters:
 *        - name: 'parentId'
 *          in: 'query'
 *          description: 层级'
 *          type: 'number'
 *          default: null
 *      responses:
 *          200:
 *            description: "successful operation"
 *            schema:
 *              properties:
 *                success:
 *                  type: "boolean"
 *                  example: true
 *                data:
 *                  type: 'array'
 *                  items:
 *                    $ref: "#/definitions/QuestionStore"
 */
