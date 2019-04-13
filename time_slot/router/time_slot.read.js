const express = require('express');
const { validate } = require('../../utils/validation');
const { find, avaiables } = require('../');

const router = express.Router({ mergeParams: true });

module.exports = router;

/**
 * @swagger
 * /time-slot:
 *   get:
 *     description: Recupera a lista de dias com seus respectivos intervalos
 *     parameters:
 *       - in: query
 *         name: day
 *         type: string
 *         description: Dia formatado DD-MM-YYYY
 *       - in: query
 *         name: start
 *         type: string
 *         description: Dia formatado DD-MM-YYYY - se utilizado, trará datas no intervalo. Necessário informar os dois intervalos
 *       - in: query
 *         name: end
 *         type: string
 *         description: Dia formatado DD-MM-YYYY - se utilizado, trará datas no intervalo. Necessário informar os dois intervalos
 *       - in: query
 *         name: page
 *         type: number
 *         description: Página a ser buscada (0 / n - 1)
 *       - in: query
 *         name: limit
 *         type: number
 *         description: Limite de resultados a serem recuperados
 *     responses:
 *       '200':
 *         description: Lista dos dias
 */

router.get(
  '/',
  validate({ day: 'slotDate?', start: 'slotTime?', end: 'slotTime?', page: 'numeric?', limit: 'numeric?' }, 'query'),
  (req, res) => {
    res.json(find(req.validData));
  },
);

/**
 * @swagger
 * /time-slot/avaiables:
 *   get:
 *     description: Lista dos dias com seus intervalos disponíveis
 *     parameters:
 *       - in: query
 *         name: start
 *         type: string
 *         description: Dia formatado DD-MM-YYYY
 *       - in: query
 *         name: end
 *         type: string
 *         description: Dia formatado DD-MM-YYYY
 *       - in: query
 *         name: page
 *         type: number
 *         description: Página a ser buscada (0 / n - 1)
 *       - in: query
 *         name: limit
 *         type: number
 *         description: Limite de resultados a serem recuperados
 *     responses:
 *       '200':
 *         description: Lista dos dias e os intervalos disponíveis
 */
router.get(
  '/avaiables',
  validate({ start: 'slotDate', end: 'slotDate', page: 'numeric?', limit: 'numeric?' }, 'query'),
  (req, res) => {
    res.json(avaiables(req.validData));
  },
);
