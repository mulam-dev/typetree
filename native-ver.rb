require 'glimmer-dsl-libui'

include Glimmer

class Node < Struct.new(:type, :opts, :inner)
  class << self
    def elem(*inner, **opts) = self.new(:elem, opts, inner)
    def layout(style, *inner, **) = self.new(:layout, {style:, **}, inner)
    def atom(style, **) = self.new(:atom, {style:, **}, nil)

    # Layouts
    def vbox(*, **) = self.layout(:box, *, dir: :vertical, **)
    def hbox(*, **) = self.layout(:box, *, dir: :horizontal, **)
    def bracket(...) = self.layout(:bracket, ...)

    # Atoms
    def label(text, **) = self.atom(:label, text:, **)
    def head(text, **) = self.label(text, primary: true, **)
    def hint(text, **) = self.label(text, opacity: 0.36, **)
  end
end
  
@inner = (0...1).map do
  Node.elem(
    Node.head('for', color: 'func'),
    Node.vbox(
      Node.bracket(
        Node.elem(
          Node.head('index', color: 'var')),
        Node.hint('in'),
        Node.elem(
          Node.head('Ary', color: 'func'),
          Node.bracket(
            Node.elem(
              Node.head('1', color: 'val')),
            Node.elem(
              Node.head('2', color: 'val')),
            Node.elem(
              Node.head('3', color: 'val'))))),
      Node.bracket(
        Node.vbox(
          Node.elem(
            Node.hint('this is a comment')),
          Node.elem(
            Node.elem(
              Node.head('x', color: 'var')),
            Node.head('=', color: 'opt'),
            Node.elem(
              Node.elem(
                Node.head('index', color: 'var')),
              Node.head('+', color: 'opt'),
              Node.elem(
                Node.head('1', color: 'val')))),
          Node.elem(
            Node.hint('...'))))))
end

@src = Node.vbox(*@inner)

class NodeView
  include Glimmer::LibUI::CustomControl

  option :node

  def inner_nodes
    node.inner.each { |inner_node| node_view(node: inner_node) }
  end

  body {
    case node.type
    when :elem
      horizontal_box {
        padded false
        stretchy false
        inner_nodes
      }
    when :layout
      case node.opts[:style]
      when :box
        vertical_box {
          padded false
          stretchy false
          inner_nodes
        }
      when :bracket
        horizontal_box {
          padded false
          stretchy false
          scrolling_area(8) {
            stretchy false
            text {
              string('[')
            }
          }
          inner_nodes
          scrolling_area(8) {
            stretchy false
            text {
              string(']')
            }
          }
        }
      end
    when :atom
      case node.opts[:style]
      when :label
        klass = 'n t-atom s-label'
        klass += ' f-primary' if node.opts[:primary]
        style = ''
        case
        when v = node.opts[:opacity] then style += "opacity: #{v};"
        when v = node.opts[:color] then style += "--color: var(--c-#{v});"
        end
        # area {
        #   text {
        #     string(node.opts[:text])
        #   }
        # }
        label(node.opts[:text]) {
          stretchy false
        }
      end
    end
  }
end

class Editor
  include Glimmer::LibUI::CustomControl

  options :node, :cursor
  option :shrink, default: false

  attr_reader :active_elem, :anchor_elem, :focus_elem

  # def active_elem=(elem)
  #   @v_cursor.get_animations[0]&.currentTime = 0
  #   if elem != @active_elem
  #     if v_cursor = @v_cursor.dom_element
  #       if elem
  #         root_offset = @v_overlay.offset
  #         offset = elem.offset
  #         v_cursor.css '--x', "#{offset.left - root_offset.left}px"
  #         v_cursor.css '--y', "#{offset.top - root_offset.top}px"
  #         v_cursor.css '--w', "#{elem.width}px"
  #         v_cursor.css '--h', "#{elem.height}px"
  #         v_cursor.add_class 'f-show'
  #       else
  #         v_cursor.remove_class 'f-show'
  #       end
  #     end
  #     elem.add_class 'f-active' if elem
  #     @active_elem.remove_class 'f-active' if @active_elem
  #     @active_elem = elem
  #   end
  # end

  # def anchor_elem=(elem)
  #   if elem != @anchor_elem
  #     @anchor_elem = elem
  #     update_selection
  #   end
  # end

  # def focus_elem=(elem)
  #   if elem != @focus_elem
  #     @focus_elem = elem
  #     update_selection
  #   end
  # end

  # def update_selection
  #   if @focus_elem && @anchor_elem
  #     if @focus_elem == @anchor_elem
  #       self.select_elems = Element[]
  #       self.active_elem = @focus_elem
  #     else
  #       anchor_root = @anchor_elem.parentsUntil(Element['.t-elem, .editor'].has(@focus_elem), '.t-elem').addBack.first
  #       focus_root = @focus_elem.parentsUntil(Element['.t-elem, .editor'].has(@anchor_elem), '.t-elem').addBack.first
  #       all_elems = anchor_root.parent.closest('.t-elem, .editor').find('.t-elem:not(:scope .t-elem .t-elem)')
  #       start_idx, end_idx = [all_elems.index(anchor_root), all_elems.index(focus_root)].sort
  #       self.select_elems = all_elems.slice(start_idx, end_idx + 1)
  #       self.active_elem = anchor_root == focus_root ? focus_root : nil
  #     end
  #   else
  #     self.select_elems = Element[]
  #   end
  # end

  # def select_elems=(elems)
  #   @select_elems ||= Element[]
  #   # elems = Element[] if elems.length == 1
  #   elems.not(@select_elems).add_class 'f-select'
  #   @select_elems.not(elems).remove_class 'f-select'
  #   @select_elems = elems
  # end

  # def closest_elem(v_node)
  #   elem = v_node.closest '.t-elem'
  #   elem.length > 0 and elem.closest(@v_root.dom_element).length > 0 and elem
  # end

  body {
    @v_root = vertical_box {
      node_view(node: node)
      @v_overlay = vertical_box {
        @v_cursor = vertical_box
      }
      # onpointerdown do |e|
      #   if e['button'] == 0
      #     e.stop_propagation
      #     elem = closest_elem(e.target)
      #     @anchor_elem = elem
      #     @focus_elem = nil
      #     update_selection
      #     self.active_elem = elem
      #     if elem
      #       @v_root.dom_element.focus
      #       Document.on 'pointermove', &handle_pointermove = -> (e) do
      #         if @anchor_elem && elem = closest_elem(e.target)
      #           e.stop_propagation
      #           self.focus_elem = elem
      #         end
      #       end
      #       Document.one 'pointerup' do |e|
      #         if e['button'] == 0
      #           if @anchor_elem && elem = closest_elem(e.target)
      #             e.stop_propagation
      #             self.focus_elem = elem
      #           end
      #           Document.off 'pointermove', &handle_pointermove
      #         end
      #       end
      #     end
      #   end
      # end
    }
  }
end

window('App') {
  editor(node: @src)
}.show
