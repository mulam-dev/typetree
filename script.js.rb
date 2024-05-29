include Glimmer

class Node < Struct.new(:type, :label, :inner)
  def self.block(*inner)
    Node.new(:block, nil, inner)
  end
  def self.line(*inner)
    Node.new(:line, nil, inner)
  end
  def self.hint(label)
    Node.new(:hint, label)
  end
  def self.text(label)
    Node.new(:text, label)
  end
  def self.rect(*inner)
    Node.new(:rect, nil, inner)
  end
end

@src = Node.new(:func, 'for', [
  Node.block(
    Node.line(
      Node.rect(
        Node.new(:var, 'index'),
        Node.hint('in'),
        Node.new(:class, 'Ary', [
          Node.rect(
            Node.new(:num, '1'),
            Node.new(:num, '2'),
            Node.new(:num, '3'),
          ),
        ]),
      ),
    ),
    Node.line(
      Node.rect(
        Node.block(
          Node.line(
            Node.new(:var, 'x'),
            Node.new(:func, '='),
            Node.new(:var, 'index'),
            Node.new(:func, '+'),
            Node.new(:num, '1'),
          ),
          Node.line(
            Node.new(:func, 'puts'),
            Node.new(:var, 'x'),
          ),
        ),
      ),
    ),
  ),
])

class NodeElem
  include Glimmer::Web::Component

  option :node

  markup {
    div(class: "node t-#{node.type.to_s}") {
      if node.label
        span(node.label, class: 'i-label')
      end
      if node.inner.respond_to?('each')
        div(class: 'i-flow') {
          node.inner.each do |item|
            node_elem(node: item)
          end
        }
      end
    }
  }
end

class Editor
  include Glimmer::Web::Component

  options :node, :cursor

  markup {
    div(class: 'editor') {
      # div(style: 'margin-left: 4px') {'for [index in Ary [1 2 3]]'}
      node_elem(node: node)
    }
  }
end

Document.ready? do
  editor(node: @src)
  style {
    <<~CSS
      body {
        background: #181818;
        color: #fff;
        font-family: "Source Code Pro", monospace;
        font-size: 16px;
      }
      .editor {
        --rt-color: #666;
        --rt-border: 1px;
        --rt-width: max(calc(0.5em - var(--rt-border) - 4px), 2px);
        display: flex;
        flex-direction: column;
        align-items: start;
      }
      .node {
        transition: background 200ms;
        display: flex;
        color: #fff;
        cursor: default;
        padding: 0 0.25em;
        pointer-events: all;
      }
      .node:not(:has(.node:hover)):hover {
        outline: solid 1px #4af8;
        background: #08f4;
      }
      .node > .i-flow {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
      }
      .node > .i-label + .i-flow {
        margin-left: 0.625em;
      }
      .node.t-hint, .node.t-split {
        color: #777;
        pointer-events: none;
      }
      .node.t-split, .node.t-rect > .i-flow {
        margin: 0 -0.125em;
        padding: 0;
      }
      .node.t-split:last-child {
        align-items: end;
      }
      .node.t-block, .node.t-line, .node.t-rect {
        pointer-events: none;
        padding: 0;
      }
      .node.t-split + .node.t-split { padding-left: 0.25em }
      .node.t-func { color: #4af }
      .node.t-class { color: #4bb }
      .node.t-num { color: #ccc }
      .node.t-var { color: #f80 }
      .node.t-block > .i-flow { flex-direction: column }
      .node.t-rect::before, .node.t-rect::after {
        content: " ";
        margin: 4px 2px;
        width: var(--rt-width);
        border: var(--rt-border) solid var(--rt-color);
      }
      .node.t-rect::before { border-right: 0 none }
      .node.t-rect::after { border-left: 0 none }
    CSS
  }
end
