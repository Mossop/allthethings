import type { Token } from "../../utils";
import { queryHook, api, mutationHook } from "../../utils";

const itemRefreshTokens: Token[] = [
  api.state.getState,
  api.project.listContents,
  api.item.listItems,
];

export const useListItems = queryHook(api.item.listItems, {
  pollInterval: 60000,
});

export const useCreateTaskMutation = mutationHook(api.item.createTask, {
  refreshTokens: itemRefreshTokens,
});

export const useCreateLinkMutation = mutationHook(api.item.createLink, {
  refreshTokens: itemRefreshTokens,
});

export const useEditTaskMutation = mutationHook(api.item.editTask, {
  refreshTokens: itemRefreshTokens,
});

export const useEditTaskController = mutationHook(api.item.editTaskController, {
  refreshTokens: itemRefreshTokens,
});

export const useEditItemMutation = mutationHook(api.item.editItem, {
  refreshTokens: itemRefreshTokens,
});

export const useDeleteItemMutation = mutationHook(api.item.deleteItem, {
  refreshTokens: itemRefreshTokens,
});

export const useCreateContextMutation = mutationHook(
  api.context.createContext,
  {
    refreshTokens: [api.state.getState],
  },
);

export const useEditContextMutation = mutationHook(api.context.editContext, {
  refreshTokens: [api.state.getState],
});

export const useDeleteContextMutation = mutationHook(
  api.context.deleteContext,
  {
    refreshTokens: [api.state.getState],
  },
);

export const useCreateProject = mutationHook(api.project.createProject, {
  refreshTokens: [api.state.getState],
});

export const useEditProjectMutation = mutationHook(api.project.editProject, {
  refreshTokens: [api.state.getState],
});

export const useDeleteProjectMutation = mutationHook(
  api.project.deleteProject,
  {
    refreshTokens: [api.state.getState],
  },
);

export const useCreateSectionMutation = mutationHook(
  api.section.createSection,
  {
    refreshTokens: [api.project.listContents],
  },
);

export const useEditSectionMutation = mutationHook(api.section.editSection, {
  refreshTokens: itemRefreshTokens,
});

export const useDeleteSectionMutation = mutationHook(
  api.section.deleteSection,
  {
    refreshTokens: itemRefreshTokens,
  },
);

export const useLogin = mutationHook(api.login.login, {
  refreshTokens: [api.state.getState],
});

export const useLogout = mutationHook(api.logout.logout, {
  refreshTokens: [api.state.getState],
});

export const useChangePasswordMutation = mutationHook(api.users.editUser);

export const useListUsersQuery = queryHook(api.users.listUsers);

export const useCreateUserMutation = mutationHook(api.users.createUser, {
  refreshTokens: [api.users.listUsers],
});

export const useDeleteUserMutation = mutationHook(api.users.deleteUser, {
  refreshTokens: [api.users.listUsers, api.state.getState],
});

export const usePageContentQuery = queryHook(api.page.getPageContent, {
  format: "text",
});
