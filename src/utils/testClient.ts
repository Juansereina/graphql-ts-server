import * as request from "request-promise";

export class TestClient {
  url: string;
  options: {
    jar: any;
    withCredentials: boolean;
    json: boolean;
  };
  constructor(url = '' ) {
    this.url = process.env.TEST_HOST as string + url;
    this.options = {
      withCredentials: true,
      jar: request.jar(),
      json: true
    };
  }

  async register(email: string, password: string) {
    return request.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            register(email: "${email}", password: "${password}") {
              path
              message
            }
          }
        `
      }
    });
  }

  async logout() {
    return request.post(this.url, {
      ...this.options,
      body: {
        query:`
        mutation {
          logout
        }
        `
      }
    });
  }

  async forgotPasswordChange(newPassword: string, key: string) {
    return request.post(this.url, {
      ...this.options,
      body: {
        query: `
          mutation {
            forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
              path
              message
            }
          }
        `
      }
    });
}

  async me() {
    return request.post(this.url, {
      ...this.options,
      body: {
        query: `
          {
            me {
              id
              email
            }
          }
        `
      }
    });
  }

  async login(email: string, password: string) {
    return request.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `
      }
    });
  }
}