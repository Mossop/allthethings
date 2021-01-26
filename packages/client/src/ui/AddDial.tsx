import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import { useCallback, useState } from "react";

import { ProjectIcon } from "../components/Icons";
import type { ViewType } from "../utils/navigation";
import type { TaskList } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import CreateProjectDialog from "./CreateProjectDialog";

interface AddDialProps {
  taskList: TaskList;
  viewType: ViewType;
}

export default ReactMemo(function AddDial({
  taskList,
}: AddDialProps): ReactResult {
  let [open, setOpen] = useState(false);
  let [projectAddDialogOpen, setProjectAddDialogOpen] = useState(false);

  let openDial = useCallback(() => setOpen(true), []);
  let closeDial = useCallback(() => setOpen(false), []);

  let openAddProject = useCallback(() => {
    setProjectAddDialogOpen(true);
  }, []);
  let closeAddProject = useCallback(() => {
    setProjectAddDialogOpen(false);
  }, []);

  return <>
    <SpeedDial
      ariaLabel="Add to project"
      direction="up"
      icon={<SpeedDialIcon/>}
      open={open}
      onOpen={openDial}
      onClose={closeDial}
    >
      <SpeedDialAction
        tooltipTitle="Add Project..."
        icon={<ProjectIcon/>}
        onClick={openAddProject}
      />
    </SpeedDial>
    {projectAddDialogOpen && <CreateProjectDialog taskList={taskList} onClose={closeAddProject}/>}
  </>;
});
