import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      'vscode-perf-issue',
      {
        provideTextDocumentContent(uri: vscode.Uri): string {
          const htmlContent = fs.readFileSync(path.resolve(context.asAbsolutePath('src/index.html')), 'utf-8')
          return htmlContent.replace('{{path}}', 'file://' + context.asAbsolutePath('dist/build.js'))
        }
      }
    )
  )

  context.subscriptions.push(vscode.commands.registerCommand('extension.previewPerfIssue', () => {
    vscode.commands.executeCommand(
      'vscode.previewHtml',
      vscode.Uri.parse('vscode-perf-issue://new-issue'),
      vscode.ViewColumn.Two,
      'New Perf Issue'
    )
  }))
}
