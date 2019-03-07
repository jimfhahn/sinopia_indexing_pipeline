import mockConsole from 'jest-mock-console'
import Stomp from 'stomp-client'
import Config from '../src/config'
import Listener from '../src/listener'
import Logger from '../src/logger'

// Mocks to avoid making real stomp connections
import BrokerFake from '../__mocks__/broker-fake'

// Outermost-scope variable to support mocking/restoring the `console` object
let restoreConsole = null

describe('Listener', () => {
  let listener = new Listener()

  describe('constructor', () => {
    test('sets this.logger', () => {
      expect(listener.logger).toBeInstanceOf(Logger)
    })
    test('sets this.client', () => {
      expect(listener.client).toBeInstanceOf(Stomp)
    })
  })
  describe('listen()', () => {
    let newMessageHandler = jest.fn()
    let logSpy = jest.spyOn(listener.logger, 'debug')

    beforeEach(() => {
      listener.client = new BrokerFake(Config.brokerHost, Config.brokerPort)
    })
    beforeAll(() => {
      // Eat console output
      restoreConsole = mockConsole(['error', 'debug'])
    })
    afterAll(() => {
      restoreConsole()
    })
    test('logs a debug message before connecting', () => {
      listener.listen(newMessageHandler)
      expect(logSpy).toHaveBeenCalledWith(`connecting to stomp at ${Config.brokerHost}:${Config.brokerPort}`)
    })
    test('calls connect on the client', () => {
      let clientSpy = jest.spyOn(listener.client, 'connect')

      listener.listen(newMessageHandler)
      expect(clientSpy).toHaveBeenCalledTimes(1)
    })
    test('logs a debug message before subscribing to queue', () => {
      listener.listen(newMessageHandler)
      expect(logSpy).toHaveBeenCalledWith(`subscribing to ${Config.queueName}, waiting for messages`)
    })
    test('subscribes to specified queue with given callback', () => {
      let clientSpy = jest.spyOn(listener.client, 'subscribe')

      listener.listen(newMessageHandler)
      expect(clientSpy).toHaveBeenCalledWith(Config.queueName, newMessageHandler)
    })
  })
})
