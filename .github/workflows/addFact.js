const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { Octokit } = require("@octokit/rest");

process.env.GITHUB_REF = "auto-fact";
process.env.GITHUB_SHA = "0ee6b6521ee5061bee54cfb65cd8f00352a7eaa4";
process.env.GITHUB_EVENT_PATH = "/Volumes/18f/18f-bot-facts/event.json";

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
    exec(...cmd, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });

(async () => {
  const github = new Octokit({ userAgent: "18f bot facts" });

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

  const [, type, rawFact] =
    body.match(
      /^### What kind of fact are you adding\?\n\n([^\n]+)\n\n### Your new fact:\n\n(.*)$/im
    ) ?? [];

  const allFactsPath = path.join(__dirname, "..", "..", `${type}.json`);

  if (!type.length || !rawFact.length) {
    return;
  }
  if (!(await exists(allFactsPath))) {
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

  const o = await cmd("git status");
  console.log(o);
})();
