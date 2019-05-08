const compile_init = {};

(() => {

    const visit = compile_init;

    visit.visit = (node) => {
        const name = "visit_"+node.type;
        if (typeof visit[name] === "function") {
            return visit[name](node);
        } else {
            console.error("Unsupported language construct: " + node.type);
            console.log(JSON.stringify(node, null, 4));
            return "";
        }
    };

    visit.visit_children = (children) => {
        return children.map(child => visit.visit(child));
    };

    visit.visit_body = (children) => {
        return visit.visit_children(children).join(";");
    };

    visit.visit_ExpressionStatement = (node) => {
        return visit.visit(node.expression);
    };

    visit.visit_Program = (node) => {
        return visit.visit_body(node.body);
    };

    visit.visit_Literal= (node) => {
        return node.raw;
    };

    visit.visit_ObjectExpression = (node) => {
        let output = "{";
        output += node.properties.map(p=>visit.visit(p)).join(",");
        output += "}";
        return output;
    };

    visit.visit_Property = (node) => {
        let output = "";
        const key = visit.visit(node.key);
        const value = visit.visit(node.value);
        return `${key}:${value}`;
    };

    visit.visit_FunctionDeclaration = (node) => {
        const id = visit.visit(node.id);
        const params = visit.visit_children(node.params).join(",");
        const body = visit.visit(node.body);
        return `${id}(${params}){${body}}`;
    };

    visit.visit_BlockStatement = (node) => {
        const body = visit.visit_body(node.body);
        return `{${body}}`;
    };

    visit.visit_ReturnStatement = (node) => {
        const argument = visit.visit(node.argument);
        return `return ${argument}`;
    };

    visit.visit_ArrayExpression = (node) => {
        const elements = visit.visit_children(node.elements);
        return "["+elements.join(",")+"]";
    };

    let call_depth = -1;

    const symbol_table = {};

    visit.visit_CallExpression = (node) => {
        call_depth++;
        const callee = visit.visit(node.callee);
        const args = visit.visit_children(node.arguments);
        const indentation = new Array(call_depth).fill("  ").join("");
        call_depth--;
        if (callee[0] && callee[0] === "$") {
            const elname = callee.slice(1).toLowerCase();
            return `\n\n${indentation}create_element("${elname}", ${args.join(",")})`;
        } else {
            return `${callee}(${args.join(",")})`;
        }
    };

    visit.visit_AssignmentExpression = (node) => {
        const left = visit.visit(node.left);
        const right = visit.visit(node.right);
        return left + "=" + right;
    };

    visit.visit_SpreadElement = (node) => {
        return "..." + visit.visit(node.argument);
    };

    visit.visit_Identifier = (node) => {
        return `${node.name}`;
    };

    visit.visit_MemberExpression = (node) => {
        const object = visit.visit(node.object);
        const prop = visit.visit(node.property);
        if (node.computed) {
            return `${object}[${prop}]`;
        } else {
            return `${object}.${prop}`;
        }
    };

    visit.visit_ArrowFunctionExpression = (node) => {
        const params = visit.visit_children(node.params).join(",");
        const body = visit.visit(node.body);
        return `(${params})=>${body}`;
    };
})();
