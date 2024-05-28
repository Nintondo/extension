interface ISession {
  origin: string;
  icon: string;
  name: string;

  pushMessage?: <T>(event: string, data: T) => void;
}

class Session implements ISession {
  origin: string;
  icon: string;
  name: string;

  constructor(data: ISession) {
    this.origin = data.origin;
    this.icon = data.icon;
    this.name = data.name;
  }
}

class SessionMap {
  sessionMap: Map<number, ISession>;

  constructor() {
    this.sessionMap = new Map();
  }

  getSession(id: number): ISession | undefined {
    return this.sessionMap.get(id);
  }

  createSession(id: number, data?: ISession) {
    const session = new Session(data);
    this.sessionMap.set(id, session);
    return session;
  }

  deleteSession(id: number) {
    this.sessionMap.delete(id);
  }

  broadcastEvent<T>(ev: string, data?: T, origin?: string) {
    let sessions: (ISession & { key: number })[] = [];
    this.sessionMap.forEach((session, key) => {
      sessions.push({
        key,
        ...session,
      });
    });

    // same origin
    if (origin) {
      sessions = sessions.filter((session) => session.origin === origin);
    }

    sessions.forEach((session) => {
      try {
        session.pushMessage(ev, data);
      } catch (e) {
        if (this.sessionMap.has(session.key)) {
          this.deleteSession(session.key);
        }
      }
    });
  }
}

export default new SessionMap();
