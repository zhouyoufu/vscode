import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
const opn = require('opn')

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'vscode-perf-issue',
      {
        provideTextDocumentContent(uri: vscode.Uri): string {
          let htmlContent = fs.readFileSync(path.resolve(context.asAbsolutePath('src/index.html')), 'utf-8')
          htmlContent = htmlContent.replace('{{logoPath}}', 'file://' + context.asAbsolutePath('vscode-issue-helper/dist/logo.png'))
					htmlContent = htmlContent.replace('{{path}}', 'file://' + context.asAbsolutePath('vscode-issue-helper/dist/build.js'))
					return htmlContent
        }
      }
    )
  )

  context.subscriptions.push(vscode.commands.registerCommand('extension.previewPerfIssue', ({ vscodeInfo }) => {
    vscode.commands.executeCommand(
      'vscode.previewHtml',
      vscode.Uri.parse('vscode-perf-issue://new-issue'),
      vscode.ViewColumn.Two,
      'New Perf Issue'
    ).then(() => {
      vscode.commands.executeCommand('_workbench.htmlPreview.postMessage',
        'vscode-perf-issue://new-issue',
        vscodeInfo
      )
    })
  }))

  context.subscriptions.push(vscode.commands.registerCommand('extension.openWindow', (uri) => {
    const baseURL = 'https://github.com/microsoft/vscode/issues/new?body='
    console.log(baseURL + uri)
    opn(baseURL + uri)
  }))
}
