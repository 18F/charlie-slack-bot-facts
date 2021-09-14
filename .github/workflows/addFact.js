const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { Octokit } = require("@octokit/rest");

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
};

const getFact = (rawFact) => {
  if (/^{[\s\S]+}$/m.test(rawFact)) {
    try {
      return JSON.parse(rawFact);
    } catch (e) {
      console.log("There was a problem parsing this fact.");
      console.log(e);
      throw e;
    }
  }
  return rawFact;
};

const cmd = (...cmd) =>
  new Promise((resolve, reject) => {
    console.log(...cmd);
    exec(...cmd, (err, stdout) => {
      if (err) {
        reject(new Error(err));
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });

(async () => {
  const github = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "18f bot facts",
  });

  const {
    issue: { number: issueNumber },
    repository: {
      name: repo,
      owner: { login: owner },
    },
  } = JSON.parse(
    await fs.readFile(process.env.GITHUB_EVENT_PATH, { encoding: "utf-8" })
  );

  const {
    data: { body },
  } = await github.rest.issues.get({ owner, repo, issue_number: issueNumber });

  const [, type, rawFact] = body
    .replace(/\r/g, "")
    .match(
      /^### What kind of fact are you adding\?\n\n([^\n]+)\n\n### Your new fact:\n\n(.*)$/im
    ) ?? [null, "", ""];

  const allFactsPath = path.join(__dirname, "..", "..", `${type}.json`);

  if (!type.length || !rawFact.length) {
    console.log("### Issue doesn't match expected format");
    console.log(`  Type: ${type}`);
    console.log(`  Fact: ${rawFact}`);

    return;
  }
  if (!(await exists(allFactsPath))) {
    console.log("### Issue refers to a type of fact I don't know");
    console.log(`   Type: ${type}`);
    return;
  }

  const fact = getFact(rawFact);
  const allFacts = JSON.parse(
    await fs.readFile(allFactsPath, { encoding: "utf-8" })
  );
  allFacts.push(fact);
  await fs.writeFile(allFactsPath, JSON.stringify(allFacts, null, 2), {
    encoding: "utf-8",
  });

  const branch = `add-fact/${issueNumber}`;
  await cmd(`git config --local user.email "mgwalker@users.noreply.github.com"`);
  await cmd(`git config --local user.name "automatic update"`);
  await cmd(`git checkout -b ${branch}`);
  await cmd(`git add ${allFactsPath}`);
  await cmd(`git commit -m "automatically-added fact"`);
  await cmd(`git push origin ${branch}`);

  await github.pulls.create({
    base: "main",
    body: `This fact is being added automatically from the contents of #${issueNumber}`,
    head: branch,
    owner,
    repo,
    title: `Adding fact for #${issueNumber}`,
  });
})();
