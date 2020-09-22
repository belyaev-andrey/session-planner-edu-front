import { CubaApp, FetchOptions } from "@cuba-platform/rest";

export type sessionplanner_SessionService_findSessionsBySpeaker_params = {
  speakerEmail: string;
};

export var restServices = {
  sessionplanner_SessionService: {
    findSessionsBySpeaker: (cubaApp: CubaApp, fetchOpts?: FetchOptions) => (
      params: sessionplanner_SessionService_findSessionsBySpeaker_params
    ) => {
      return cubaApp.invokeService(
        "sessionplanner_SessionService",
        "findSessionsBySpeaker",
        params,
        fetchOpts
      );
    }
  }
};
