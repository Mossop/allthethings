import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import {
  ReactMemo,
  useBoolState,
  Dialog,
  TextFieldInput,
  FormState,
  api,
  mutationHook,
} from "../../utils";
import type { Project, TaskList } from "../schema";
import GlobalState from "../utils/globalState";
import { pushView, ViewType } from "../utils/view";

interface CreateProjectProps {
  onClosed: () => void;
  taskList: TaskList;
}

let useCreateProject = mutationHook(api.project.createProject, {
  refreshTokens: [api.state.getState],
});

export default ReactMemo(function CreateProjectDialog({
  onClosed,
  taskList,
}: CreateProjectProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen, , close] = useBoolState(true);

  let [createProjectMutation, { loading, error }] = useCreateProject();

  let createProject = useCallback(async () => {
    let data = await createProjectMutation({
      taskListId: taskList.id,
      params: state,
    });

    let user = GlobalState.user;
    if (!user) {
      throw new Error("Invalid state.");
    }

    let newProject: Project | undefined = undefined;

    for (let context of user.contexts.values()) {
      newProject = context.projects.get(data.id);
      if (newProject) {
        break;
      }
    }

    if (!newProject) {
      throw new Error("New project not present in user state.");
    }

    pushView({
      type: ViewType.TaskList,
      taskList: newProject,
    });

    close();
  }, [close, createProjectMutation, state, taskList.id]);

  return (
    <Dialog
      title="Create Project"
      submitLabel="Create"
      error={error}
      isOpen={isOpen}
      onClose={close}
      onClosed={onClosed}
      onSubmit={createProject}
      formState={loading ? FormState.Loading : FormState.Default}
    >
      <TextFieldInput
        id="name"
        label="Name:"
        autoFocus={true}
        state={state}
        setState={setState}
        stateKey="name"
      />
    </Dialog>
  );
});
