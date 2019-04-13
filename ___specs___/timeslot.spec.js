/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const path = require('path');

const server = require('../');

chai.use(chaiHttp);

const { expect } = chai;

const fsPromise = fs.promises;

describe('time slot', () => {
  before(async () => {
    return fsPromise.writeFile(path.join(__dirname, '../time_slot/persist/timeslot_test.json'), '[]');
  });

  it('should return an empty array', () => {
    chai
      .request(server)
      .get('/api/time-slot')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.empty;
      });
  });

  it('should create an interval with none recurrence', () => {
    chai
      .request(server)
      .post('/api/time-slot')
      .type('json')
      .send({
        day: '10-10-2018',
        intervals: [{ start: '10:10', end: '10:20' }],
        recurrence: 'none',
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
      });
  });

  it('should throw exception time conflict', () => {
    chai
      .request(server)
      .post('/api/time-slot')
      .type('json')
      .send({
        day: '10-10-2018',
        intervals: [{ start: '10:10', end: '10:20' }],
        recurrence: 'none',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
      });
  });

  it('should throw an exception because of invalid date format', () => {
    chai
      .request(server)
      .post('/api/time-slot')
      .type('json')
      .send({
        day: '10/10/2018',
        intervals: [{ start: '20:20', end: '20:30' }],
        recurrence: 'daily',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
      });
  });

  it('should throw an exception because of invalid time format', () => {
    chai
      .request(server)
      .post('/api/time-slot')
      .type('json')
      .send({
        day: '10-10-2018',
        intervals: [{ start: '20:0', end: '20:30' }],
        recurrence: 'daily',
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
      });
  });
});
