const { expect } = require('chai');
const sinon = require('sinon');
const mochaEventually = require('mocha-eventually');
const eventually = fn => mochaEventually(fn, 8000, 50);
const TscWatchClient = require('../lib/client');
const { driver: tscWatchDriver } = require('./driver.js');

describe('Client Events', () => {
  let watchClient;
  let callback;

  beforeEach(() => {
    watchClient = new TscWatchClient();
    callback = sinon.stub();
  });
  afterEach(() => watchClient.kill());

  describe('Events', () => {
    it('Should emit "first_success" on first success', () => {
      watchClient.on('first_success', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/passing.ts');

      return eventually(() => expect(callback.calledOnce).to.be.true);
    });

    it('Should fire "subsequent_success" on subsequent successes', () => {
      watchClient.on('subsequent_success', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/passing.ts');
      tscWatchDriver.modifyAndSucceedAfter(1500);

      return eventually(() => expect(callback.calledOnce).to.be.true);
    });

    it('Should fire "compile_errors" on when tsc compile errors occur', () => {
      watchClient.on('compile_errors', callback);
      watchClient.start('--noClear', '--out', './tmp/output.js', './tmp/fixtures/failing.ts');

      return eventually(() => expect(callback.calledOnce).to.be.true);
    });
  });
});
