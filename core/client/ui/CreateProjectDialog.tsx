import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import { ReactMemo, useBoolState, Dialog, TextFieldInput, FormState } from "#ui";

import type { Project, TaskList } from "../schema";
import { useCreateProjectMutation, refetchListContextStateQuery } from "../schema";
import GlobalState from "../utils/globalState";
import { pushView, ViewType } from "../utils/view";

interface CreateProjectProps {
  onClosed: () => void;
  taskList: TaskList;
}

export default ReactMemo(function CreateProjectDialog({
  onClosed,
  taskList,
}: CreateProjectProps): ReactElement {
  let [state, setState] = useState({
    name: "",
  });

  let [isOpen,, close] = useBoolState(true);

  let [createProjectMutation, { loading, error }] = useCreateProjectMutation({
    variables: {
      taskList: taskList.id,
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let createProject = useCallback(async () => {
    let { data } = await createProjectMutation();
    let user = GlobalState.user;
    if (!data || !user) {
      throw new Error("Invalid state.");
    }

    let newProject: Project | undefined = undefined;

    for (let context of user.contexts.values()) {
      newProject = context.projects.get(data.createProject.id);
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
  }, [close, createProjectMutation]);

  return <Dialog
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
  </Dialog>;
});
