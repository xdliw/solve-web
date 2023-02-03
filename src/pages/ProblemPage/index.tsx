import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BASE, ContestProblem, ErrorResponse, observeProblem, Problem, ProblemStatementSample } from "../../api";
import Page from "../../components/Page";
import Alert from "../../ui/Alert";
import Block from "../../ui/Block";
import ByteSize from "../../ui/ByteSize";
import Duration from "../../ui/Duration";
import Icon from "../../ui/Icon";
import IconButton from "../../ui/IconButton";
import Latex from "../../ui/Latex";
import Sidebar from "../../ui/Sidebar";

import "./index.scss";

type ProblemSamplesProps = {
	samples: ProblemStatementSample[];
};

const ProblemSamlpes: FC<ProblemSamplesProps> = props => {
	const { samples } = props;
	return <table className="ui-table section samples">
		<thead>
			<tr>
				<th className="input">Input data</th>
				<th className="output">Output data</th>
			</tr>
		</thead>
		<tbody>
			{samples.map((sample: ProblemStatementSample, key: number) => {
				const { input, output } = sample;
				return <tr key={key}>
					<td className="input">
						<div className="copy-wrap">
							<pre>{input ?? ""}</pre>
							<IconButton kind="document" onClick={() => { navigator.clipboard.writeText(input ?? "") }} />
						</div>
					</td>
					<td className="output">
						<div className="copy-wrap">
							<pre>{output ?? ""}</pre>
							<IconButton kind="document" onClick={() => { navigator.clipboard.writeText(output ?? "") }} />
						</div>
					</td>
				</tr>;
			})}
		</tbody>
	</table>;
};

type ProblemBlockProps = {
	problem: ContestProblem | Problem;
	imageBaseUrl?: string;
};

export const ProblemBlock: FC<ProblemBlockProps> = props => {
	const { problem, imageBaseUrl } = props;
	const { config, statement } = problem;
	const contestProblem = problem as ContestProblem;
	return <Block title={`${contestProblem.code ? `${contestProblem.code}. ` : ""}${statement?.title ?? problem.title}`} className="b-problem-statement">
		{config && <table className="ui-table section limits">
			<tbody>
				{config.time_limit && <tr>
					<td>Time limit:</td>
					<td><Duration value={config.time_limit * 0.001} /></td>
				</tr>}
				{config.memory_limit && <tr>
					<td>Memory limit:</td>
					<td><ByteSize value={config.memory_limit} /></td>
				</tr>}
				<tr>
					<td>Input:</td>
					<td><code>stdin</code></td>
				</tr>
				<tr>
					<td>Output:</td>
					<td><code>stdout</code></td>
				</tr>
			</tbody>
		</table>}
		<Latex className={"section legend"} content={statement?.legend} imageBaseUrl={imageBaseUrl} />
		{statement?.input && <>
			<h3>Input</h3>
			<Latex className={"section input"} content={statement?.input} imageBaseUrl={imageBaseUrl} />
		</>}
		{statement?.output && <>
			<h3>Output</h3>
			<Latex className={"section output"} content={statement?.output} imageBaseUrl={imageBaseUrl} />
		</>}
		{statement?.samples && <>
			<h3>Samples</h3>
			<ProblemSamlpes samples={statement.samples} />
		</>}
		{statement?.notes && <>
			<h3>Notes</h3>
			<Latex className={"section notes"} content={statement?.notes} imageBaseUrl={imageBaseUrl} />
		</>}
	</Block>;
};

type ManageProblemSideBlockProps = {
	problem: Problem;
};

export const ManageProblemSideBlock: FC<ManageProblemSideBlockProps> = props => {
	const { problem } = props;
	return <Block className="b-sidebar" title="Manage problem">
		<ul>
			<li><Link to={`/problems/${problem.id}`}>
				<Icon kind="document" />
				<span className="label">View problem</span>
			</Link></li>
			<li><Link to={`/problems/${problem.id}/edit`}>
				<Icon kind="edit" />
				<span className="label">Edit problem</span>
			</Link></li>
		</ul>
	</Block>;
};

const ProblemPage: FC = () => {
	const params = useParams();
	const { problem_id } = params;
	const [problem, setProblem] = useState<Problem>();
	const [error, setError] = useState<ErrorResponse>();
	useEffect(() => {
		setProblem(undefined);
		observeProblem(Number(problem_id))
			.then(setProblem)
			.catch(setError);
	}, [problem_id]);
	if (error) {
		return <Page title="Error" sidebar={<Sidebar />}>
			{error.message && <Alert>{error.message}</Alert>}
		</Page>;
	}
	const canUpdate = problem?.permissions?.includes("update_problem");
	return <Page title="Problem" sidebar={<>
		{problem && canUpdate && <ManageProblemSideBlock problem={problem as Problem} />}
		<Sidebar />
	</>}>
		{problem ?
			<>
				<ProblemBlock problem={problem} imageBaseUrl={`${BASE}/api/v0/problems/${problem.id}/resources/`} />
			</> :
			<>Loading...</>}
	</Page>;
};

export default ProblemPage;
