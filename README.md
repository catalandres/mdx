sfdx-mdx
========



[![Version](https://img.shields.io/npm/v/sfdx-mdx.svg)](https://npmjs.org/package/sfdx-mdx)
[![CircleCI](https://circleci.com/gh/catalandres/mdx/tree/master.svg?style=shield)](https://circleci.com/gh/catalandres/mdx/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/catalandres/mdx?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/mdx/branch/master)
[![Codecov](https://codecov.io/gh/catalandres/mdx/branch/master/graph/badge.svg)](https://codecov.io/gh/catalandres/mdx)
[![Greenkeeper](https://badges.greenkeeper.io/catalandres/mdx.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/catalandres/mdx/badge.svg)](https://snyk.io/test/github/catalandres/mdx)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-mdx.svg)](https://npmjs.org/package/sfdx-mdx)
[![License](https://img.shields.io/npm/l/sfdx-mdx.svg)](https://github.com/catalandres/mdx/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-mdx
$ sfdx-mdx COMMAND
running command...
$ sfdx-mdx (-v|--version|version)
sfdx-mdx/0.1.0 darwin-x64 node-v11.6.0
$ sfdx-mdx --help [COMMAND]
USAGE
  $ sfdx-mdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx-mdx mdx:list`](#sfdx-mdx-mdxlist)
* [`sfdx-mdx mdx:object:describe`](#sfdx-mdx-mdxobjectdescribe)
* [`sfdx-mdx mdx:object:list`](#sfdx-mdx-mdxobjectlist)

## `sfdx-mdx mdx:list`

list all the metadata types in an org or, if a type is specified, all the components of that type

```
USAGE
  $ sfdx-mdx mdx:list

OPTIONS
  -t, --type=type                                 metadata object type
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --all                                           all flag description
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLES
      $ sfdx mdx:list -u targetusername
      $ sfdx mdx:list -t CustomObject -u targetusername
```

_See code: [src/commands/mdx/list.ts](https://github.com/catalandres/mdx/blob/v0.1.0/src/commands/mdx/list.ts)_

## `sfdx-mdx mdx:object:describe`

Renders a tree with all metadata objects

```
USAGE
  $ sfdx-mdx mdx:object:describe

OPTIONS
  -o, --object=object                             name to print
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLE
      $ sfdx mdx:object:describe -u targetusername -o Account
```

_See code: [src/commands/mdx/object/describe.ts](https://github.com/catalandres/mdx/blob/v0.1.0/src/commands/mdx/object/describe.ts)_

## `sfdx-mdx mdx:object:list`

Renders a tree with all metadata objects

```
USAGE
  $ sfdx-mdx mdx:object:list

OPTIONS
  -f, --filter=filter                             filter flag description
  -u, --targetusername=targetusername             username or alias for the target org; overrides default target org
  --apiversion=apiversion                         override the api version used for api requests made by this command
  --json                                          format output as json
  --loglevel=(trace|debug|info|warn|error|fatal)  logging level for this command invocation

EXAMPLE
      $ sfdx mdx:object:list -u targetusername
```

_See code: [src/commands/mdx/object/list.ts](https://github.com/catalandres/mdx/blob/v0.1.0/src/commands/mdx/object/list.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
