import Sequelize from 'sequelize';
import { _ } from 'lodash';
import faker from 'faker';

const GROUPS = 2;
const USERS_PER_GROUP = 5;
const MESSAGE_PER_USER = 6;
faker.seed(123);

const db = new Sequelize('mychat', null, null, {
  dialect: 'sqlite',
  storage: './mychat.sqlite',
  logging: false,
});

const UserModel = db.define('user', {
  email: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
});

const GroupModel = db.define('group', {
  name: { type: Sequelize.STRING },
});

const MessageModel = db.define('message', {
  text: { type: Sequelize.STRING },
});

UserModel.belongsToMany(GroupModel, { through: 'GroupUser' });
UserModel.belongsToMany(UserModel, { through: 'Friends', as: 'friends' });
MessageModel.belongsTo(UserModel);
MessageModel.belongsTo(GroupModel);
GroupModel.belongsToMany(UserModel, { through: 'GroupUser' });

db.sync({ force: true }).then(() =>
  _.times(GROUPS, () =>
    GroupModel.create({
      name: faker.lorem.words(3),
    })
      .then(group =>
        _.times(USERS_PER_GROUP, () => {
          const password = faker.internet.password();
          return group
            .createUser({
              email: faker.internet.email(),
              username: faker.internet.userName(),
              password,
            })
            .then((user) => {
              console.log(
                '{email, username, password}',
                `{${user.email}, ${user.username}, ${password}}`,
              );
              _.times(MESSAGE_PER_USER, () =>
                MessageModel.create({
                  userId: user.id,
                  groupId: group.id,
                  text: faker.lorem.sentences(3),
                }),
              );
              return user;
            });
        }),
      )
      .then((userPromises) => {
        Promise.all(userPromises).then((users) => {
          _.each(users, (current, i) => {
            _.each(users, (user, j) => {
              if (i !== j) {
                current.addFriend(user);
              }
            });
          });
        });
      }),
  ),
);

const Group = db.models.group;
const Message = db.models.message;
const User = db.models.user;
export { Group, Message, User };
