import { IconButton, MenuItem } from "@material-ui/core";

import type { ReactResult } from "../../utils";
import {
  pushClickedLink,
  Icons,
  ReactMemo,
  Menu,
  useMenuState,
  bindTrigger,
} from "../../utils";
import type { Problem } from "../schema";
import { useProblems } from "../utils/globalState";

export default ReactMemo(function ProblemsMenu(): ReactResult {
  let problems = useProblems();
  let problemsMenuState = useMenuState("problems-menu");

  if (!problems.length) {
    return null;
  }

  return (
    <>
      <IconButton {...bindTrigger(problemsMenuState)}>
        <Icons.Error color="error" />
      </IconButton>
      <Menu
        state={problemsMenuState}
        anchor={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {problems.map((problem: Problem) => (
          <MenuItem
            key={problem.description}
            component="a"
            href={problem.url}
            onClick={pushClickedLink}
          >
            {problem.description}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});
