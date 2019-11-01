'use strict';

module.exports = function syndications() {
  return [
    {
      uid: 'https://twitter.com/qubyte',
      name: 'qubyte on twitter',
      service: {
        name: 'Twitter',
        url: 'https://twitter.com/'
      },
      user: {
        name: 'qubyte',
        url: 'https://twitter.com/qubyte',
        photo: 'https://pbs.twimg.com/profile_images/958386895037267968/K7X2jWDU.jpg'
      }
    },
    {
      uid: 'https://mastodon.social/@qubyte',
      name: 'qubyte on mastodon.social',
      service: {
        name: 'Mastodon',
        url: 'https://mastodon.social/'
      },
      user: {
        name: '@qubyte',
        url: 'https://mastodon.social/@qubyte',
        photo: 'https://files.mastodon.social/accounts/avatars/000/034/232/original/19ce997f84ca75fe.png'
      }
    }
  ];
};
