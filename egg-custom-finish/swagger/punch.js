/**
 * @swagger
 * paths:
 *  /punch/record:
 *    parameters:
 *      - $ref: "#/parameters/LoginTokenHeader"
 *    delete:
 *      tags:
 *      - 'punch'
 *      summary: '删除打卡'
 *      description: '删除打卡'
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
 *                  type: "array"
 *                  example: [1]
 *    get:
 *      tags:
 *      - 'punch'
 *      summary: '查询打卡记录'
 *      description: '查询打卡记录'
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
 *                  type: 'array'
 *                  items:
 *                    $ref: "#/definitions/PunchRecord"
 */
