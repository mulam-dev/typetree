include Glimmer

class Node < Struct.new(:type, :opts, :inner)
  def self.elem(*inner, **opts) = Node.new(:elem, opts, inner)
  def self.layout(style, *inner, **opts) = Node.new(:layout, {style:, **opts}, inner)
  def self.atom(style, **opts) = Node.new(:atom, {style:, **opts}, nil)

  # Layouts
  def self.vbox(*inner, **opts) = self.layout(:box, *inner, dir: :vertical, **opts)
  def self.hbox(*inner, **opts) = self.layout(:box, *inner, dir: :horizontal, **opts)
  def self.bracket(*inner, **opts) = self.layout(:bracket, *inner, **opts)
  
  # Atoms
  def self.label(text, **opts) = self.atom(:label, text:, **opts)
  def self.head(text, **opts) = self.label(text, primary: true, **opts)
  def self.hint(text, **opts) = self.label(text, opacity: 0.36, **opts)
end

@src =
Node.vbox(
  Node.elem(
    Node.head('for', color: 'func'),
    Node.vbox(
      Node.bracket(
        Node.elem(
          Node.head('index', color: 'var')
        ),
        Node.hint('in'),
        Node.elem(
          Node.head('Ary', color: 'func'),
          Node.bracket(
            Node.elem(
              Node.head('1', color: 'val'),
            ),
            Node.elem(
              Node.head('2', color: 'val'),
            ),
            Node.elem(
              Node.head('3', color: 'val'),
            )
          )
        )
      ),
      Node.bracket(
        Node.vbox(
          Node.elem(
            Node.hint('this is a comment')
          ),
          Node.elem(
            Node.elem(
              Node.head('x', color: 'var')
            ),
            Node.head('=', color: 'opt'),
            Node.elem(
              Node.elem(
                Node.head('index', color: 'var')
              ),
              Node.head('+', color: 'opt'),
              Node.elem(
                Node.head('1', color: 'val')
              )
            )
          ),
          Node.elem(
            Node.hint('...')
          )
        )
      )
    )
  )
)

class NodeElem
  include Glimmer::Web::Component

  option :node

  markup {
    case node.type
    when :elem
      div(class: 'n t-elem') {
        node.inner.each { |n| node_elem(node: n) }
      }
    when :layout
      case node.opts[:style]
      when :box
        div(class: "n t-layout s-box f-dir-#{node.opts[:dir]}") {
          node.inner.each { |n| node_elem(node: n) }
        }
      when :bracket
        div(class: 'n t-layout s-bracket') {
          node.inner.each { |n| node_elem(node: n) }
        }
      end
    when :atom
      case node.opts[:style]
      when :label
        klass = 'n t-atom s-label'
        klass += ' f-primary' if node.opts[:primary]
        style = ''
        case
        when o = node.opts[:opacity] then style += "opacity: #{o};"
        when c = node.opts[:color] then style += "--color: var(--c-#{c});"
        end
        span(class: klass, style: style == '' ? nil : style) {node.opts[:text]}
      end
    end
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
  link(rel: 'stylesheet', href: './style.css')
end
