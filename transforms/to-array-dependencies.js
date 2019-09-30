module.exports = function(file, api) {
  const j = api.jscodeshift
  const firstArgIsArray = p => {
    const [firstArg] = p.value.arguments

    if (firstArg.type === 'ArrayExpression') return true
    if (firstArg.type !== 'Identifier') return false

    const x = p.scope.lookup(firstArg.name)
    const decl = j(x.getBindings()[firstArg.name][0]).closest(
      j.VariableDeclaration
    )

    return (
      Boolean(decl.size()) &&
      decl.nodes()[0].declarations[0].init.type === 'ArrayExpression'
    )
  }
  return j(file.source)
    .find(j.CallExpression, {
      callee: {
        name: 'createSelector'
      }
    })
    .filter(
      p =>
        p.value.arguments.length > 2 ||
        (p.value.arguments.length === 2 && !firstArgIsArray(p))
    )
    .replaceWith(p =>
      j.callExpression(j.identifier('createSelector'), [
        j.arrayExpression(p.value.arguments.slice(0, -1)),
        p.value.arguments[p.value.arguments.length - 1]
      ])
    )
    .toSource()
}
