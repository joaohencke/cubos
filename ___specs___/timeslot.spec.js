/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const path = require('path');

const server = require('../');

chai.use(chaiHttp);

const { expect } = chai;

const fsPromise = fs.promises;

let existingEntity;

describe('time slot', () => {
  before(async () => {
    return fsPromise.writeFile(path.join(__dirname, '../time_slot/persist/timeslot_test.json'), '[]');
  });

  it('should return an empty array', done => {
    chai
      .request(server)
      .get('/api/time-slot')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.empty;
        done();
      });
  });

  it('should create an interval with none recurrence', done => {
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
        existingEntity = res.body;
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        done();
      });
  });
  it('should create an interval with daily recurrence', done => {
    chai
      .request(server)
      .post('/api/time-slot')
      .type('json')
      .send({
        day: '08-10-2018',
        intervals: [{ start: '01:35', end: '01:45' }, { start: '02:35', end: '02:45' }],
        recurrence: 'daily',
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.have.property('id');
        done();
      });
  });

  it('should throw exception time conflict', done => {
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
        done();
      });
  });

  it('should throw an exception because of invalid date format', done => {
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
        done();
      });
  });

  it('should throw an exception because of invalid time format', done => {
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
        done();
      });
  });

  it('sould remove an existing entity', done => {
    chai
      .request(server)
      .delete(`/api/time-slot/${existingEntity.id}`)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  it('should retrieve a list of avaiables times between a date', done => {
    chai
      .request(server)
      .get('/api/time-slot/avaiables')
      .query({ start: '08-10-2018', end: '12-10-2018' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(5);
        done();
      });
  });

  it('should retrieve a list of avaiables times between a date', done => {
    chai
      .request(server)
      .get('/api/time-slot/avaiables')
      .query({ start: '07-10-2018', end: '12-10-2018' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.length(5);
        done();
      });
  });
});
