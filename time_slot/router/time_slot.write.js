const express = require('express');
const { validate, struct } = require('../../utils/validation');
const { create, remove } = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

/**
 * @swagger
 * /time-slot:
 *   post:
 *     description: Cadastra um novo intervalo no dia ou adiciona ou intervalo ao dia já existente
 *     parameters:
 *       - in: body
 *         schema:
 *          $ref: '#/definitions/TimeSlot'
 *     responses:
 *       '201':
 *          description: Slot criado
 *       '400':
 *          description: Caso exista algum conflito
 */
router.post(
  '/',
  validate(
    {
      day: 'slotDate',
      intervals: struct.list([struct.partial({ start: 'slotTime', end: 'slotTime' })]),
      recurrence: struct.enum(['none', 'daily', 'weekly']),
    },
    'body',
  ),
  (req, res, next) => {
    create(req.validData)
      .then(result => res.status(201).json(result))
      .catch(next);
  },
);

/**
 * @swagger
 * /time-slot/{day}:
 *  delete:
 *    description: Remove um dia da lista
 *    parameters:
 *      - in: path
 *        name: day
 *        description: O dia a ser removido no formato DD-MM-YYYY
 *        required: true
 *    responses:
 *      '204':
 *        description: Removido com sucesso
 *      '400':
 *        description: Caso o dia informado não exista
 */

router.delete('/:day', validate({ day: 'slotDate' }, 'params'), (req, res, next) => {
  remove(req.validData)
    .then(() => res.status(204).end())
    .catch(next);
});
