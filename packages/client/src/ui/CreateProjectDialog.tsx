import { ReactMemo, useBoolState, Dialog, TextFieldInput } from "@allthethings/ui";
import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import { useCreateProjectMutation } from "../schema/mutations";
import { refetchListContextStateQuery } from "../schema/queries";
import type { TaskList } from "../utils/state";
import { useProjectRoot } from "../utils/state";
import { useView, pushView, ViewType } from "../utils/view";

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
  let view = useView();

  let [isOpen,, close] = useBoolState(true);

  let [createProject, { data, error }] = useCreateProjectMutation({
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
