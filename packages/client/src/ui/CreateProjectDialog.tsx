import { ReactMemo, useBoolState, Dialog, TextFieldInput, FormState } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import type { TaskList } from "../schema";
import { useCreateProjectMutation, refetchListContextStateQuery } from "../schema";
import { useProjectRoot, useLoggedInView, pushView, ViewType } from "../utils/view";

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
  let root = useProjectRoot();
  let view = useLoggedInView();

  let [isOpen,, close] = useBoolState(true);

  let [createProject, { data, loading, error }] = useCreateProjectMutation({
    variables: {
      taskList: taskList.id,
      params: state,
    },
    refetchQueries: [
      refetchListContextStateQuery(),
    ],
  });

  let newProject = useMemo(() => {
    if (!data) {
      return null;
    }

    return root.projects.get(data.createProject.id) ?? null;
  }, [data, root]);

  useEffect(() => {
    if (!newProject) {
      return;
    }

    pushView({
      type: ViewType.TaskList,
      taskList: newProject,
    }, view);

    close();
  }, [newProject, close, view]);

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
      state={state}
      setState={setState}
      stateKey="name"
    />
  </Dialog>;
});
