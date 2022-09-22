import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Page from "../../components/Page";
import {
	Compilers,
	Contest,
	ContestParticipant,
	ContestParticipants,
	ContestProblem,
	ContestProblems,
	ContestSolution,
	ContestSolutions,
	createContestParticipant,
	createContestProblem,
	deleteContest,
	deleteContestParticipant,
	deleteContestProblem,
	ErrorResponse,
	observeCompilers,
	observeContestParticipants,
	observeContestProblems,
	observeContestSolution,
	observeContestSolutions,
	Solution,
	submitContestSolution,
	TestReport,
	updateContest,
} from "../../api";
import Block, { BlockProps } from "../../ui/Block";
import FormBlock from "../../components/FormBlock";
import Field from "../../ui/Field";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Alert from "../../ui/Alert";
import UserLink from "../../ui/UserLink";
import DateTime from "../../ui/DateTime";
import { Tab, TabContent, Tabs, TabsGroup } from "../../ui/Tabs";
import DurationInput from "../../ui/DurationInput";
import Checkbox from "../../ui/Checkbox";

import "./index.scss";

type ContestBlockParams = {
	contest: Contest;
};

const ContestProblemsBlock: FC<ContestBlockParams> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [problems, setProblems] = useState<ContestProblems>();
	useEffect(() => {
		observeContestProblems(contest.id)
			.then(problems => {
				setProblems(problems)
				setError(undefined)
			})
			.catch(setError)
	}, [contest.id]);
	if (!problems) {
		return <Block title="Problems" className="b-contest-problems">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestProblems: ContestProblem[] = problems.problems ?? [];
	contestProblems.sort((a, b: ContestProblem) => {
		return String(a.code).localeCompare(b.code);
	});
	return <Block title="Problems" className="b-contest-problems">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="code">#</th>
					<th className="title">Title</th>
				</tr>
			</thead>
			<tbody>
				{contestProblems.map((problem: ContestProblem, key: number) => {
					const { code, title } = problem;
					return <tr key={key} className="problem">
						<td className="code">
							<Link to={`/contests/${contest.id}/problems/${code}`}>{code}</Link>
						</td>
						<td className="title">
							<Link to={`/contests/${contest.id}/problems/${code}`}>{title}</Link>
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	}</Block>;
};

const ContestSolutionsBlock: FC<ContestBlockParams> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [solutions, setSolutions] = useState<ContestSolutions>();
	useEffect(() => {
		observeContestSolutions(contest.id)
			.then(result => setSolutions(result || []))
			.catch(setError);
	}, [contest.id]);
	if (!solutions) {
		return <Block title="Solutions" className="b-contest-solutions">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestSolutions: ContestSolution[] = solutions.solutions ?? [];
	return <Block title="Solutions" className="b-contest-solutions">{error ?
		<Alert>{error.message}</Alert> :
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="date">Date</th>
					<th className="participant">Participant</th>
					<th className="problem">Problem</th>
					<th className="verdict">Verdict</th>
					<th className="points">Points</th>
				</tr>
			</thead>
			<tbody>
				{contestSolutions.map((solution: ContestSolution, key: number) => {
					const { id, report, participant, problem, create_time } = solution;
					return <tr key={key} className="problem">
						<td className="id">
							<Link to={`/contests/${contest.id}/solutions/${id}`}>{id}</Link>
						</td>
						<td className="date">
							<DateTime value={create_time} />
						</td>
						<td className="participant">
							{participant && participant.user ? <UserLink user={participant.user} /> : <>&mdash;</>}
						</td>
						<td className="problem">
							{problem ? <Link to={`/contests/${contest.id}/problems/${problem.code}`}>{`${problem.code}. ${problem.title}`}</Link> : <>&mdash;</>}
						</td>
						<td className="verdict">
							{report ? report.verdict : "running"}
						</td>
						<td className="points">
							{(report && report.points) || <>&mdash;</>}
						</td>
					</tr>;
				})}
			</tbody>
		</table>
	}</Block>;
};

type ContestSolutionBlockProps = {
	contest: Contest;
	solutionID: number;
};

const ContestSolutionBlock: FC<ContestSolutionBlockProps> = props => {
	const { contest, solutionID } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [solution, setSolution] = useState<ContestSolution>();
	useEffect(() => {
		observeContestSolution(contest.id, solutionID)
			.then(setSolution)
			.catch(setError);
	}, [contest.id, solutionID]);
	useEffect(() => {
		if (!solution || (solution.report?.verdict !== "queued" && solution.report?.verdict !== "running")) {
			return;
		}
		const updateSolution = () => {
			observeContestSolution(contest.id, solution.id)
				.then(setSolution)
				.catch(setError);
		};
		const interval = setInterval(updateSolution, 2000);
		return () => clearInterval(interval);
	}, [contest.id, solution]);
	if (!solution) {
		return <Block title="Solution" className="b-contest-solution">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	const { id, report, participant, problem, create_time } = solution;
	return <>
		<Block title={`Solution #${id}`} className="b-contest-solution">
			{error && <Alert>{error.message}</Alert>}
			<table className="ui-table">
				<thead>
					<tr>
						<th className="id">#</th>
						<th className="date">Date</th>
						<th className="participant">Participant</th>
						<th className="problem">Problem</th>
						<th className="verdict">Verdict</th>
						<th className="points">Points</th>
					</tr>
				</thead>
				<tbody>
					<tr className="problem">
						<td className="id">
							<Link to={`/contests/${contest.id}/solutions/${id}`}>{id}</Link>
						</td>
						<td className="date">
							<DateTime value={create_time} />
						</td>
						<td className="participant">
							{participant && participant.user ? <UserLink user={participant.user} /> : <>&mdash;</>}
						</td>
						<td className="problem">
							{problem ? <Link to={`/contests/${contest.id}/problems/${problem.code}`}>{`${problem.code}. ${problem.title}`}</Link> : <>&mdash;</>}
						</td>
						<td className="verdict">
							{report ? report.verdict : "running"}
						</td>
						<td className="points">
							{(report && report.points) || <>&mdash;</>}
						</td>
					</tr>
				</tbody>
			</table>
		</Block>
		{report && <Block title="Tests" className="b-contest-solution">
			<table className="ui-table">
				<thead>
					<tr>
						<th className="id">#</th>
						<th className="verdict">Verdict</th>
						<th className="check-log">Check log</th>
					</tr>
				</thead>
				<tbody>{report.tests?.map((test: TestReport, key: number) => {
					return <tr className="problem">
						<td className="id">{key + 1}</td>
						<td className="verdict">
							{test ? test.verdict : "running"}
						</td>
						<td className="check-log">
							{(test && test.check_log) || <>&mdash;</>}
						</td>
					</tr>;
				})}</tbody>
			</table>
		</Block>}
	</>;
};

const ContestProblemSideBlock: FC = () => {
	const params = useParams();
	const { contest_id, problem_code } = params;
	const [newSolution, setNewSolution] = useState<Solution>();
	const [file, setFile] = useState<File>();
	const [compiler, setCompiler] = useState<number>();
	const [error, setError] = useState<ErrorResponse>();
	const [compilers, setCompilers] = useState<Compilers>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		setError(undefined);
		file && compiler && submitContestSolution(Number(contest_id), String(problem_code), {
			compiler_id: compiler,
			file: file,
		})
			.then(solution => {
				setNewSolution(solution);
				setFile(undefined);
				setError(undefined);
			})
			.catch(setError);
	};
	useEffect(() => {
		observeCompilers()
			.then(setCompilers)
			.catch(setError)
	}, []);
	if (newSolution) {
		return <Navigate to={`/contests/${contest_id}/solutions/${newSolution.id}`} />
	}
	const errorMessage = error && error.message;
	const invalidFields = (error && error.invalid_fields) || {};
	return <FormBlock onSubmit={onSubmit} title="Submit solution" footer={
		<Button color="primary">Submit</Button>
	}>
		{errorMessage && <Alert>{errorMessage}</Alert>}
		<Field title="Compiler:">
			<select
				name="compiler_id"
				value={String(compiler || compilers?.compilers?.at(0)?.id)}
				onChange={(e: ChangeEvent<HTMLSelectElement>) => setCompiler(Number(e.target.value))}
				required>
				{compilers?.compilers?.map((compiler, index) =>
					<option value={compiler.id} key={index}>{compiler.name}</option>
				)}
			</select>
			{invalidFields["compiler_id"] && <Alert>{invalidFields["compiler_id"].message}</Alert>}
		</Field>
		<Field title="Solution file:">
			<input
				type="file" name="file"
				onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0])}
				required />
			{invalidFields["file"] && <Alert>{invalidFields["file"].message}</Alert>}
		</Field>
	</FormBlock >;
};

const ContestProblemBlock: FC = () => {
	const params = useParams();
	const { contest_id, problem_code } = params;
	const [problem, setProblem] = useState<ContestProblem>();
	useEffect(() => {
		fetch("/api/v0/contests/" + contest_id + "/problems/" + problem_code)
			.then(result => result.json())
			.then(result => setProblem(result));
	}, [contest_id, problem_code]);
	if (!problem) {
		return <>Loading...</>;
	}
	return <Block title={problem.title}>
		{/* <div className="problem-statement" dangerouslySetInnerHTML={{__html: problem.Description}}/> */}
	</Block>;
};

type ContestTabsProps = BlockProps & {
	contest: Contest;
	currentTab?: string;
};

const ContestTabs: FC<ContestTabsProps> = props => {
	const { contest } = props;
	const { permissions } = contest;
	const canManage = permissions && (permissions.includes("update_contest") || permissions.includes("delete_contest"));
	return <Block className="b-contest-tabs">
		<Tabs>
			<Tab tab="problems">
				<Link to={`/contests/${contest.id}`}>Problems</Link>
			</Tab>
			<Tab tab="solutions">
				<Link to={`/contests/${contest.id}/solutions`}>Solutions</Link>
			</Tab>
			{canManage && <Tab tab="manage">
				<Link to={`/contests/${contest.id}/manage`}>Manage</Link>
			</Tab>}
		</Tabs>
	</Block>;
};

export type EditContestBlockProps = {
	contest: Contest;
	onUpdateContest?(contest: Contest): void;
};

const toNumber = (n?: string) => {
	return n === undefined ? undefined : Number(n);
};

const toBoolean = (n?: string) => {
	return n === undefined ? undefined : n === "true";
};

const EditContestBlock: FC<EditContestBlockProps> = props => {
	const { contest, onUpdateContest } = props;
	const [form, setForm] = useState<{ [key: string]: string }>({});
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		updateContest(contest.id, {
			title: form.title,
			begin_time: toNumber(form.begin_time),
			duration: toNumber(form.duration),
			enable_registration: toBoolean(form.enable_registration),
			enable_upsolving: toBoolean(form.enable_upsolving),
		})
			.then(contest => {
				setForm({});
				setError(undefined);
				onUpdateContest && onUpdateContest(contest);
			})
			.catch(setError);
	};
	const onResetForm = () => {
		setForm({});
		setError(undefined);
	};
	return <FormBlock className="b-contest-edit" title="Edit contest" onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="primary"
			disabled={!Object.keys(form).length}
		>Change</Button>
		{!!Object.keys(form).length && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="Title:">
			<Input
				type="text" name="title" placeholder="Title"
				value={form.title ?? contest.title}
				onValueChange={value => setForm({ ...form, title: value })}
				required />
			{error && error.invalid_fields && error.invalid_fields["title"] && <Alert>{error.invalid_fields["title"].message}</Alert>}
		</Field>
		<Field title="Begin time:">
			<Input
				type="number" name="begin_time" placeholder="Begin time"
				value={form.begin_time ?? (contest.begin_time ? String(contest.begin_time) : "")}
				onValueChange={value => setForm({ ...form, begin_time: value })} />
			{error && error.invalid_fields && error.invalid_fields["begin_time"] && <Alert>{error.invalid_fields["begin_time"].message}</Alert>}
		</Field>
		<Field title="Duration:">
			<DurationInput
				value={toNumber(form.duration) ?? contest.duration}
				onValueChange={value => setForm({ ...form, duration: String(value) })} />
			{error && error.invalid_fields && error.invalid_fields["duration"] && <Alert>{error.invalid_fields["duration"].message}</Alert>}
		</Field>
		<Field name="enable_registration" errorResponse={error}>
			<Checkbox
				value={toBoolean(form.enable_registration) ?? contest.enable_registration ?? false}
				onValueChange={value => setForm({ ...form, enable_registration: value ? "true" : "false" })} />
			<span className="label">Enable registration</span>
		</Field>
		<Field name="enable_upsolving" errorResponse={error}>
			<Checkbox
				value={toBoolean(form.enable_upsolving) ?? contest.enable_upsolving ?? false}
				onValueChange={value => setForm({ ...form, enable_upsolving: value ? "true" : "false" })} />
			<span className="label">Enable upsolving</span>
		</Field>
	</FormBlock>;
};

export type DeleteContestBlockProps = {
	contest: Contest;
};

const DeleteContestBlock: FC<DeleteContestBlockProps> = props => {
	const { contest } = props;
	const [redirect, setRedirect] = useState<boolean>(false);
	const [title, setTitle] = useState<string>();
	const [error, setError] = useState<ErrorResponse>();
	const onSubmit = (event: any) => {
		event.preventDefault();
		deleteContest(contest.id)
			.then(() => setRedirect(true))
			.catch(setError);
	};
	const onResetForm = () => {
		setTitle(undefined);
		setError(undefined);
	};
	if (redirect) {
		return <Navigate to="/" />;
	}
	return <FormBlock className="b-contest-edit" title="Delete contest" onSubmit={onSubmit} footer={<>
		<Button
			type="submit" color="danger"
			disabled={title !== contest.title}
		>Delete contest</Button>
		{title && <Button type="reset" onClick={onResetForm}>Reset</Button>}
	</>}>
		{error && error.message && <Alert>{error.message}</Alert>}
		<Field title="Enter title of contest:">
			<Input
				type="text" name="title" placeholder="Title"
				value={title ?? ""}
				onValueChange={value => setTitle(value)}
				required autoComplete="off" />
		</Field>
	</FormBlock>;
};

type EditContestProblemsBlockProps = {
	contest: Contest;
};

const EditContestProblemsBlock: FC<EditContestProblemsBlockProps> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [problems, setProblems] = useState<ContestProblems>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	useEffect(() => {
		observeContestProblems(contest.id)
			.then(problems => {
				setProblems(problems)
				setError(undefined)
			})
			.catch(setError);
	}, [contest.id]);
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		createContestProblem(contest.id, {
			code: form.code ?? "",
			problem_id: Number(form.problem_id ?? 0),
		})
			.then(problem => {
				setProblems({ ...problems, problems: [...(problems?.problems ?? []), problem] });
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const canCreateProblem = contest.permissions && contest.permissions.includes("create_contest_problem");
	const canDeleteProblem = contest.permissions && contest.permissions.includes("delete_contest_problem");
	if (!problems) {
		return <Block title="Problems" className="b-contest-problems">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestProblems: ContestProblem[] = problems.problems ?? [];
	contestProblems.sort((a, b: ContestProblem) => {
		const codeDiff = String(a.code).localeCompare(b.code);
		if (codeDiff) {
			return codeDiff;
		}
		return String(a.title).localeCompare(b.title);
	});
	return <Block
		title="Problems" className="b-contest-problems"
		footer={canCreateProblem && <form onSubmit={onSubmit}>
			<Input name="code"
				value={form.code || ""}
				onValueChange={value => setForm({ ...form, code: value })}
				placeholder="Code"
				required />
			<Input name="problem_id"
				value={form.problem_id || ""}
				onValueChange={value => setForm({ ...form, problem_id: value })}
				placeholder="Problem ID"
				required />
			<Button type="submit">Create</Button>
		</form>}
	>
		{error && <Alert>{error.message}</Alert>}
		<table className="ui-table">
			<thead>
				<tr>
					<th className="code">#</th>
					<th className="title">Title</th>
					<th className="actions">Actions</th>
				</tr>
			</thead>
			<tbody>
				{contestProblems.map((problem: ContestProblem, key: number) => {
					const { code, title } = problem;
					const deleteProblem = () => {
						deleteContestProblem(contest.id, code)
							.then(problem => {
								const contestProblems = [...(problems?.problems ?? [])];
								const pos = contestProblems.findIndex(value => value.code === problem.code && value.title === problem.title);
								if (pos >= 0) {
									contestProblems.splice(pos, 1);
								}
								setProblems({ ...problems, problems: contestProblems });
								setForm({});
								setError(undefined);
							})
							.catch(setError);
					};
					return <tr key={key} className="problem">
						<td className="code">{code}</td>
						<td className="title">{title}</td>
						<td className="actions">{canDeleteProblem && <Button onClick={deleteProblem}>Delete</Button>}</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>;
};

type EditContestParticipantsBlockProps = {
	contest: Contest;
};

const EditContestParticipantsBlock: FC<EditContestParticipantsBlockProps> = props => {
	const { contest } = props;
	const [error, setError] = useState<ErrorResponse>();
	const [participants, setParticipants] = useState<ContestParticipants>();
	const [form, setForm] = useState<{ [key: string]: string }>({});
	useEffect(() => {
		observeContestParticipants(contest.id)
			.then(participants => {
				setParticipants(participants)
				setError(undefined)
			})
			.catch(setError);
	}, [contest.id]);
	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		createContestParticipant(contest.id, {
			user_id: Number(form.user_id ?? 0),
			user_login: form.user_id,
			kind: form.kind ?? "regular",
		})
			.then(participant => {
				setParticipants({ ...participants, participants: [...(participants?.participants ?? []), participant] });
				setForm({});
				setError(undefined);
			})
			.catch(setError);
	};
	const canCreateParticipant = contest.permissions && contest.permissions.includes("create_contest_participant");
	const canDeleteParticipant = contest.permissions && contest.permissions.includes("delete_contest_participant");
	if (!participants) {
		return <Block title="Participants" className="b-contest-participants">
			{error ? <Alert>{error.message}</Alert> : "Loading..."}
		</Block>;
	}
	let contestParticipants: ContestParticipant[] = participants.participants ?? [];
	contestParticipants.sort((a, b: ContestParticipant) => {
		return a.id - b.id;
	});
	return <Block
		title="Participants" className="b-contest-participants"
		footer={canCreateParticipant && <form onSubmit={onSubmit}>
			<Input name="user_id"
				value={form.user_id || ""}
				onValueChange={value => setForm({ ...form, user_id: value })}
				placeholder="User ID"
				required />
			<select name="kind" value={form.kind || "regular"} onChange={e => setForm({ ...form, kind: e.target.value })}>
				<option value={"regular"}>Regular</option>
				<option value={"upsolving"}>Upsolving</option>
				<option value={"manager"}>Manager</option>
			</select>
			<Button type="submit">Create</Button>
		</form>}
	>
		{error && <Alert>{error.message}</Alert>}
		<table className="ui-table">
			<thead>
				<tr>
					<th className="id">#</th>
					<th className="login">Login</th>
					<th className="kind">Kind</th>
					<th className="actions">Actions</th>
				</tr>
			</thead>
			<tbody>
				{contestParticipants.map((participant: ContestParticipant, key: number) => {
					const { id, user, kind } = participant;
					const deleteParticipant = () => {
						deleteContestParticipant(contest.id, id)
							.then(participant => {
								const contestParticipants = [...(participants?.participants ?? [])];
								const pos = contestParticipants.findIndex(value => value.id === participant.id);
								if (pos >= 0) {
									contestParticipants.splice(pos, 1);
								}
								setParticipants({ ...participants, participants: contestParticipants });
								setForm({});
								setError(undefined);
							})
							.catch(setError);
					};
					return <tr key={key} className="participant">
						<td className="id">{id}</td>
						<td className="login">{user ? <UserLink user={user} /> : <>&mdash;</>}</td>
						<td className="kind">{kind}</td>
						<td className="actions">{canDeleteParticipant && <Button onClick={deleteParticipant}>Delete</Button>}</td>
					</tr>;
				})}
			</tbody>
		</table>
	</Block>;
};


type ContestTabProps = {
	contest: Contest;
	setContest?(contest: Contest): void;
};

const ContestProblemsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="problems" setCurrent>
		<ContestProblemsBlock contest={contest} />
	</TabContent>;
};

const ContestSolutionsTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	return <TabContent tab="solutions" setCurrent>
		<ContestSolutionsBlock contest={contest} />
	</TabContent>;
};

const ContestSolutionTab: FC<ContestTabProps> = props => {
	const { contest } = props;
	const params = useParams();
	return <TabContent tab="solution" setCurrent>
		<ContestSolutionBlock contest={contest} solutionID={Number(params.solution_id)} />
	</TabContent>;
};

const ContestProblemTab: FC<ContestTabProps> = props => {
	return <TabContent tab="problem" setCurrent>
		<ContestProblemBlock />
	</TabContent>;
};

const ContestManageTab: FC<ContestTabProps> = props => {
	const { contest, setContest } = props;
	const { permissions } = contest;
	return <TabContent tab="manage" setCurrent>
		{permissions && permissions.includes("update_contest") && <EditContestBlock contest={contest} onUpdateContest={setContest} />}
		{permissions && (permissions.includes("observe_contest_problems")) && <EditContestProblemsBlock contest={contest} />}
		{permissions && (permissions.includes("observe_contest_participants")) && <EditContestParticipantsBlock contest={contest} />}
		{permissions && permissions.includes("delete_contest") && <DeleteContestBlock contest={contest} />}
	</TabContent>;
};

const ContestPage: FC = () => {
	const params = useParams();
	const { contest_id } = params;
	const [contest, setContest] = useState<Contest>();
	useEffect(() => {
		fetch("/api/v0/contests/" + contest_id)
			.then(result => result.json())
			.then(result => setContest(result));
	}, [contest_id]);
	if (!contest) {
		return <>Loading...</>;
	}
	const { title } = contest;
	return <Page title={`Contest: ${title}`} sidebar={<Routes>
		<Route path="/problems/:problem_code" element={<ContestProblemSideBlock />} />
	</Routes>}>
		<TabsGroup>
			<ContestTabs contest={contest} />
			<Routes>
				<Route index element={<ContestProblemsTab contest={contest} />} />
				<Route path="/solutions" element={<ContestSolutionsTab contest={contest} />} />
				<Route path="/solutions/:solution_id" element={<ContestSolutionTab contest={contest} />} />
				<Route path="/problems/:problem_code" element={<ContestProblemTab contest={contest} />} />
				<Route path="/manage" element={<ContestManageTab contest={contest} setContest={setContest} />} />
			</Routes>
		</TabsGroup>
	</Page>;
};

export default ContestPage;
