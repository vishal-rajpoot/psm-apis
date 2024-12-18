import admin from 'firebase-admin';
import Logger from '../utils/logger';

const logger = new Logger();

const serviceAccount = {
  type: 'service_account',
  project_id: 'the-psm-app',
  private_key_id: 'bdf323e13900122ee2bec7869e436da05a7c8db2',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtiDNGWpLce9qo\nq4KSDPPz0yV4B/vLMJdPthGyKYICdeJlltU/T7kKfXo3u2h4OopPiyxM+67ZxXq0\nW0kq+X7pf7WfR0dgLQYHOa5jZ+Js/5wdal3k1c8XLMqrWFI1YmEVxtjImcZPa+GH\nrmdT2rx5Bpx1Ys0P8cl6BVDdSKzp28Ha4igXPwCLyxaZtMBX4bcovgSQWHo7jplx\nJLbDtMgSnH6Lz7wZGs3noecPgu/EX0l/Cx9l22OXMQtKzGglpGK3IDmmsUx7BQ7C\nKmmtybP2z69SUweOisbixLLGm5tUT1QS2dCw0LCYpUl+NMJ4V7cky13/ytpK2mLP\npTcZmncFAgMBAAECggEADc7e0Z7RvSSdJ2W6Vo0cTk8DVhPrN7sD7Jj+uyVYDde7\n2Oc8dwoMyHu9NrkSsi+/o15eJeQIVkDDUkhJ6qxT/8LPPL+AZkk+3Q1RxeGAIA84\n02hhf0d6Gox7C1D+/aDN5oczkcbBWRQrASUMs3Hzeaff2Zav3YXDnpIqDJREr2Om\nNWLU0cMtr9wXtJYvFwQUaiMeGW8v22TZDf94FvaGIo+n1Z7MqYW3LJUayK9+Z3OW\nToFrVFfHW3UkvQ0ti+uj0F8wM4HNb6FpXb4EG69KXzf9OZ7X8YnD7EFs5oKRFjXe\nU7ApPC7wEZGNukftuH1FgVbJRsdqvtEOhqx5NpdkEwKBgQDt1ZL2aa7ibOJtjQXE\nwR6YK1IW34ryqcv9OjqpdpLcNojbGvD01ehUpHywGAG5CLQEzJBpVATGsu8k/cig\n9E1hA1fy9NDgwsSoXPy+ECbbsYJbfKrHNR7XcTo1HV3MDabEItyl7jTTZUTrFYeC\nMP+ICkdgAzdxKMlcFnfrxLdfCwKBgQC6yU9yHw+TeGM0OJ3youuRKhFrCHkYdwMV\n0eBNmvXVQeSbQPWTSL4DO8jQ7xBZjJ2wtWfPqnKrsGa1Qf98bDcNrgnh4J54XSei\nRSs5Im54a6xcmZ/DglphDgiIJ0AzwmK6lhq5MkgiuJYZtNM/Su/I3d/NcNy+K9p8\nak30DaKMLwKBgQDQCzMzOd8xUe3/xox1QDlzAvIb8A+rlbxLFtSZyI9O8qVkhHyi\nrzs8T2aC430eTu6qBAePG1/SMFPhF96YbRwC8NnOPTk6YyWD4VN1LsvPAcf2H2eE\nOoNwEivIqpeSF575k0VQIL807DENMxgGWrYsWlF1O1sUMYlydHUSWFHPYQKBgH5T\n0Kt6Xmp6rX2QHSMRFQkkzor5PA1T0H5dZ7qU51bILfjiwjROqlQ9ht/oD8LA25W7\n2u4UdWGw+IX2kPhxp/pUjtJ5vDPjrP6OkWEe7F/9UqF+NRNhggbKGvMauM1I1sUi\n6AgA/dCdzsasCYNxByNvDAJCJslnl2k17Gr3Hcx5AoGAPKCa0WQBGPK80ueYDRE3\ns45tHgW0JGg/WlvbmLCLx+rO40oo+UW0iGXV2/FsPoGDpWGV6c63iJLW+4TgYH1L\n5Yh03/qhL78ow3yfKLMpNX7O0dgsNtEnOsYJwn1jh3FSXNbFDmhcBcs5jBDKpdKN\n4wAmkb2u4+fl+jKOWd4ZcJU=\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-hw5v2@the-psm-app.iam.gserviceaccount.com',
  client_id: '117061099100493793113',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hw5v2%40the-psm-app.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (fcmToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    logger.log('Successfully sent message:', 'info', response);
    return true;
  } catch (error) {
    logger.log('Error sending message:', 'error', error);

    return false;
  }
};

export default {};
export { sendPushNotification };
