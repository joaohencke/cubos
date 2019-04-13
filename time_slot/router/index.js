const write = require('./time_slot.write');
const read = require('./time_slot.read');
/**
 * @swagger
 * definitions:
 *  Interval:
 *    type: object
 *    properties:
 *      start:
 *        type: string
 *        description: Hora e minuto formato HH:mm.
 *      end:
 *        type: string
 *        description: Hora e minuto formato HH:mm
 *  TimeSlot:
 *    type: object
 *    properties:
 *      day:
 *        type: string
 *        description: Dia formatado DD-MM-YYYY
 *      recurrence:
 *        type: string
 *        enum:
 *          - none
 *          - daily
 *          - weekly
 *      intervals:
 *        type: array
 *        items:
 *          $ref: '#/definitions/Interval'
 */
module.exports = [write, read];
