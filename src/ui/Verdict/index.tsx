import { FC } from "react";
import { SolutionReport } from "../../api";
import ByteSize from "../ByteSize";
import Duration from "../Duration";
import Tooltip from "../Tooltip";

import "./index.scss";

type VerdictProps = {
    report?: SolutionReport;
};

type VerdictInfo = {
    code: string;
    title: string;
    description: string;
};

const VERDICTS: Record<string, VerdictInfo | undefined> = {
    "queued": {
        code: "queued",
        title: "Queued",
        description: "Queued",
    },
    "running": {
        code: "running",
        title: "Running",
        description: "Running",
    },
    "accepted": {
        code: "accepted",
        title: "Accepted",
        description: "Accepted",
    },
    "rejected": {
        code: "rejected",
        title: "Rejected",
        description: "Rejected",
    },
    "compilation_error": {
        code: "ce",
        title: "CE",
        description: "Compilation error",
    },
    "time_limit_exceeded": {
        code: "tle",
        title: "TLE",
        description: "Time limit exceeded",
    },
    "memory_limit_exceeded": {
        code: "mle",
        title: "MLE",
        description: "Memory limit exceeded",
    },
    "runtime_error": {
        code: "re",
        title: "RE",
        description: "Run-time error",
    },
    "wrong_answer": {
        code: "wa",
        title: "WA",
        description: "Wrong answer",
    },
    "presentation_error": {
        code: "pe",
        title: "PE",
        description: "Presentation error",
    },
    "partially_accepted": {
        code: "pa",
        title: "Partial",
        description: "Partially accepted",
    },
    "failed": {
        code: "failed",
        title: "Failed",
        description: "Failed",
    },
};

const Verdict: FC<VerdictProps> = props => {
    const { report } = props;
    const verdict = report?.verdict;
    const used_time = report?.used_time;
    const used_memory = report?.used_memory;
    const info = verdict ? VERDICTS[verdict] : VERDICTS["running"];
    return <Tooltip className={`ui-verdict ${info?.code ?? "unknown"}`} content={<>
        <div className="ui-verdict-details">
            <span className="item description">{info?.description ?? verdict}</span>
            {used_time && <span className="item time"><Duration value={used_time * 0.001} /></span>}
            {used_memory && <span className="item memory"><ByteSize value={used_memory} /></span>}
        </div>
    </>}>{info?.title ?? verdict}</Tooltip >;
};

export default Verdict;
