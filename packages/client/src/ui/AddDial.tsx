import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import { useCallback, useState } from "react";

import { ProjectIcon, SectionIcon } from "../components/Icons";
import type { ViewType } from "../utils/navigation";
import type { TaskList } from "../utils/state";
import type { ReactResult } from "../utils/types";
import { ReactMemo } from "../utils/types";
import CreateProjectDialog from "./CreateProjectDialog";
import CreateSectionDialog from "./CreateSectionDialog";

interface AddDialProps {
  taskList: TaskList;
  viewType: ViewType;
}

export default ReactMemo(function AddDial({
  taskList,
}: AddDialProps): ReactResult {
  let [open, setOpen] = useState(false);
  let [projectAddDialogOpen, setProjectAddDialogOpen] = useState(false);
  let [sectionAddDialogOpen, setSectionAddDialogOpen] = useState(false);

  let openDial = useCallback(() => setOpen(true), []);
  let closeDial = useCallback(() => setOpen(false), []);

  let openAddProject = useCallback(() => {
    setProjectAddDialogOpen(true);
  }, []);
  let closeAddProject = useCallback(() => {
    setProjectAddDialogOpen(false);
  }, []);

  let openAddSection = useCallback(() => {
    setSectionAddDialogOpen(true);
  }, []);
  let closeAddSection = useCallback(() => {
    setSectionAddDialogOpen(false);
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
      <SpeedDialAction
        tooltipTitle="Add Section..."
        icon={<SectionIcon/>}
        onClick={openAddSection}
      />
    </SpeedDial>
    {projectAddDialogOpen && <CreateProjectDialog taskList={taskList} onClose={closeAddProject}/>}
    {sectionAddDialogOpen && <CreateSectionDialog taskList={taskList} onClose={closeAddSection}/>}
  </>;
});
