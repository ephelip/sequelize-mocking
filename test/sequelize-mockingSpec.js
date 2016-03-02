/**
 * Testing around @{SequelizeMocking}
 *
 * @module test/sequelize-mocking
 * @version 0.1.0
 * @since 0.1.0
 * @author Julien Roche
 */

'use strict';

describe('SequelizeMocking - ', function () {
    const expect = require('chai').expect;
    const sinon = require('sinon');

    const path = require('path');
    const _ = require('lodash');

    const Sequelize = require('sequelize');
    const sequelizeFixtures = require('sequelize-fixtures');
    const SequelizeMocking = require('../lib/sequelize-mocking');

    it('shall exist', function () {
        expect(SequelizeMocking).to.exist;
        expect(SequelizeMocking).not.to.be.empty;
    });

    describe('the method "adaptSequelizeOptions" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.adaptSequelizeOptions).to.exist;
        });

        let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
            'host': 'localhost',
            'dialect': 'mysql',
            'define': {
                'engine': 'MYISAM',
                'timestamps': false,
                'paranoid': false
            },
            'pool': {
                'max': 5,
                'min': 0,
                'idle': 10000
            }
        });
        let sequelizeInstanceOptions = _.cloneDeep(sequelizeInstance.options);

        it('returns an extended sequelize configuration', function () {
            expect(SequelizeMocking.adaptSequelizeOptions(sequelizeInstance))
                .deep
                .equals({
                    'benchmark': false,
                    'databaseVersion': 0,
                    'define': {
                        'engine': 'MYISAM',
                        'paranoid': false,
                        'timestamps': false
                    },
                    'dialect': 'sqlite',
                    'dialectModulePath': null,
                    'hooks': {},
                    'host': 'localhost',
                    'isolationLevel': 'REPEATABLE READ',
                    'logging': console.log,
                    'native': false,
                    'omitNull': false,
                    'pool': {
                        'idle': 10000,
                        'max': 5,
                        'min': 0,
                    },
                    'protocol': 'tcp',
                    'query': {},
                    'quoteIdentifiers': true,
                    'replication': false,
                    'retry': {
                        'match': [
                            'SQLITE_BUSY: database is locked'
                        ],
                        'max': 5
                    },
                    'storage': ':memory:',
                    'sync': {},
                    'timezone': '+00:00',
                    'transactionType': 'DEFERRED',
                    'typeValidation': false
                });
        });

        it('does not affect the options of the sequelize instance passed as parameter', function () {
            let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance);
            expect(sequelizeInstance.options).deep.equals(sequelizeInstanceOptions);
        });

        describe('returns, based on options, ', function () {
            it('a sequelize options which allows logging', function () {
                let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance, { 'logging': true });
                expect(adaptedSequelizeOptions.logging).equals(console.log);
            });

            it('a sequelize options which disables logging', function () {
                let adaptedSequelizeOptions = SequelizeMocking.adaptSequelizeOptions(sequelizeInstance, { 'logging': false });
                expect(adaptedSequelizeOptions.logging).to.be.false;
            });
        });
    });

    describe('the method "copyModel" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.copyModel).to.exist;
        });

        it('duplicate a model with the same options', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(DuplicatedMyModel.name).equals(MyModel.name);
            expect(_.omit(DuplicatedMyModel.options, 'sequelize')).deep.equals(_.omit(MyModel.options, 'sequelize'));
        });

        it('duplicate a model without keeping the references', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(DuplicatedMyModel).not.equals(MyModel);
            expect(DuplicatedMyModel.options).not.equals(MyModel.options);
            expect(DuplicatedMyModel.attributes).not.equals(MyModel.attributes);
        });

        it('duplicate a model with upgrading the modelManager of the Sequelize instance', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(mockedSequelizeInstance.modelManager.all.length).equals(0);

            let DuplicatedMyModel = SequelizeMocking.copyModel(mockedSequelizeInstance, MyModel);
            expect(MyModel.options.sequelize).equals(sequelizeInstance);
            expect(DuplicatedMyModel.options.sequelize).equals(mockedSequelizeInstance);

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(sequelizeInstance.modelManager).equals(MyModel.modelManager);
            expect(sequelizeInstance.modelManager.all[0]).equals(MyModel);

            expect(mockedSequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager).equals(DuplicatedMyModel.modelManager);
            expect(mockedSequelizeInstance.modelManager.all[0]).equals(DuplicatedMyModel);
        });
    });

    describe('the method "copyCurrentModels" should ', function (){
        it('exist', function () {
            expect(SequelizeMocking.copyCurrentModels).to.exist;
        });

        it('copy the models of the first sequelize instance into the second one', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager.all.length).equals(0);

            SequelizeMocking.copyCurrentModels(sequelizeInstance, mockedSequelizeInstance);

            expect(sequelizeInstance.modelManager.all.length).equals(1);
            expect(mockedSequelizeInstance.modelManager.all.length).equals(1);
            expect(sequelizeInstance.modelManager.all[0]).not.equals(mockedSequelizeInstance.modelManager.all[0]);
        });

        it('use the "copyModel" function', function () {
            let mockedSequelizeInstance = new Sequelize('mocked-database', null, null, {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:'
            });

            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            let MyModel = sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });


            let spyCopyModel = sinon.spy(SequelizeMocking, 'copyModel');
            SequelizeMocking.copyCurrentModels(sequelizeInstance, mockedSequelizeInstance);

            spyCopyModel.restore();
            expect(spyCopyModel.called).to.be.true;
            expect(spyCopyModel.calledOnce).to.be.true;
            expect(spyCopyModel.calledWith(mockedSequelizeInstance, MyModel)).to.be.true;
        });
    });

    describe('and the method "loadFixtureFile" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.loadFixtureFile).to.exist;
        });

        it('call the map models function', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let stub = sinon.stub(sequelizeFixtures, 'loadFile', function () { return Promise.resolve(); });
            let spy = sinon.spy(SequelizeMocking, 'mapModels');

            SequelizeMocking.loadFixtureFile(sequelizeInstance, '/a/path/for/json/file');
            stub.restore();
            spy.restore();
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(sequelizeInstance)).to.be.true;
        });

        it('should load the fixture models file and return into the Promise the sequelize instance', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, path.resolve(path.join(__dirname, './my-model-database.json')));
                })
                .then(function (sequelize) {
                    expect(sequelize).equals(sequelizeInstance);
                });
        });

        it('should not log if the logging option is false', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let spy = sinon.spy(sequelizeFixtures, 'loadFile');
            let filePath = path.resolve(path.join(__dirname, './my-model-database.json'));

            return sequelizeInstance
                .sync()
                .then(function () {
                    return SequelizeMocking
                        .loadFixtureFile(sequelizeInstance, filePath, { 'logging': false });
                })
                .then(function () {
                    expect(spy.firstCall.args).deep.equals([
                        filePath,
                        {
                            'myModel': sequelizeInstance.modelManager.all[0]
                        },
                        {
                            'encoding': 'utf8',
                            'log': Sequelize.Utils._.noop
                        }
                    ]);
                    spy.restore();
                })
                .catch(function (err) {
                    spy.restore();
                    throw err;
                });
        });
    });

    describe('and the method "mapModels" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.mapModels).to.exist;
        });

        it('return an empty map if no Sequelize models were defined', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).to.be.defined;
            expect(mapModels).to.be.empty;
        });

        it('return a map with the defined Sequelize model', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            sequelizeInstance.define('myModel', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).to.be.defined;
            expect(mapModels).deep.equals({
                'myModel': sequelizeInstance.modelManager.all[0]
            });
        });

        it('return a map with the defined Sequelize models', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'mysql',
                'define': {
                    'engine': 'MYISAM',
                    'timestamps': false,
                    'paranoid': false
                },
                'pool': {
                    'max': 5,
                    'min': 0,
                    'idle': 10000
                }
            });

            sequelizeInstance.define('myModel1', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            sequelizeInstance.define('myModel2', {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true
                },
                'description': Sequelize.TEXT
            });

            let mapModels = SequelizeMocking.mapModels(sequelizeInstance);
            expect(mapModels).to.be.defined;
            expect(mapModels).deep.equals({
                'myModel1': sequelizeInstance.modelManager.all[0],
                'myModel2': sequelizeInstance.modelManager.all[1]
            });
        });
    });

    describe('and the method "unhookNewModel" should ', function () {
        it('exist', function () {
            expect(SequelizeMocking.unhookNewModel).to.exist;
        });

        it('do nothing if the sequelize was not mocked', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            expect(function () {
                SequelizeMocking.unhookNewModel(sequelizeInstance);
            }).not.to.throw;
        });

        it('remove the hook on the original sequelize on the mocked sequelize', function () {
            let sequelizeInstance = new Sequelize('my-database', 'mysqlUserName', 'mysqlUserPassword', {
                'host': 'localhost',
                'dialect': 'sqlite',
                'storage': ':memory:',
                'define': {
                    'timestamps': false,
                    'paranoid': false
                }
            });

            sequelizeInstance.__originalSequelize = {
                'removeHook': function (eventName) {

                }
            };

            let spy = sinon.spy(sequelizeInstance.__originalSequelize, 'removeHook');

            SequelizeMocking.unhookNewModel(sequelizeInstance);
            spy.restore();
            expect(spy.called).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith('afterDefine')).to.be.true;
        });
    });
});
